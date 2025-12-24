const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;



// Path to temp JSX scripts
const jsxFolder = path.join(__dirname, "jsx");

// Ensure jsx folder exists
const fs = require("fs");
if (!fs.existsSync(jsxFolder)) fs.mkdirSync(jsxFolder);

function runPhotoshopScript(scriptContent, callback) {
  // Save script to temp JSX file
  const filePath = path.join(jsxFolder, `tempScript.jsx`);
  fs.writeFileSync(filePath, scriptContent);

  // Run Photoshop with script
 
  const photoshopPath = `"C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Photoshop.exe"`;
  exec(`${photoshopPath} -r "${filePath}"`, (err, stdout, stderr) => {
    if (err) return callback(err.toString());
    callback(stdout || stderr);
  });
}

// MCP endpoint

app.get("/mcp", (req, res) => {
  res.json({ message: "Photoshop MCP server running" });
});

app.post("/mcp", (req, res) => {
  const { tool, args } = req.body;

  if (tool === "createImage") {
    const { width, height, color } = args;
    const jsx = `
      var doc = app.documents.add(${width}, ${height});
      app.backgroundColor.rgb.red = ${color.red || 255};
      app.backgroundColor.rgb.green = ${color.green || 255};
      app.backgroundColor.rgb.blue = ${color.blue || 255};
      doc.saveAs(new File("${path.join(__dirname, "output.png")}"), new PNGSaveOptions(), true);
    `;
    runPhotoshopScript(jsx, (output) => res.json({ result: "Image created", output }));
  } else if (tool === "addText") {
    const { text, fontSize } = args;
    const jsx = `
      if(app.documents.length > 0){
        var doc = app.activeDocument;
        var layer = doc.artLayers.add();
        layer.kind = LayerKind.TEXT;
        layer.textItem.contents = "${text}";
        layer.textItem.size = ${fontSize};
      }
    `;
    runPhotoshopScript(jsx, (output) => res.json({ result: "Text added", output }));
  } else if (tool === "batchCrop") {
    const { inputFolder, outputFolder, width, height, count } = args;
    const targetWidth = width || 1000;
    const targetHeight = height || 1000;
    const fileCount = count || 5;
    
    // Get all image files from the input folder
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.psd'];
    
    let files;
    try {
      files = fs.readdirSync(inputFolder)
        .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => ({
          name: file,
          path: path.join(inputFolder, file),
          mtime: fs.statSync(path.join(inputFolder, file)).mtime.getTime()
        }))
        .sort((a, b) => b.mtime - a.mtime) // Sort by newest first
        .slice(0, fileCount); // Take latest N files
    } catch (err) {
      return res.status(400).json({ error: "Cannot read input folder", details: err.message });
    }
    
    if (files.length === 0) {
      return res.json({ result: "No images found in folder", files: [] });
    }
    
    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    
    // Build JSX script to process all files
    const fileProcessing = files.map((file, index) => {
      const outputPath = path.join(outputFolder, `cropped_${index + 1}_${file.name.replace(/\.[^.]+$/, '.png')}`);
      return `
        var inputFile${index} = new File("${file.path.replace(/\\/g, '\\\\')}");
        if (inputFile${index}.exists) {
          var doc = app.open(inputFile${index});
          
          var newWidth = ${targetWidth};
          var newHeight = ${targetHeight};
          var docWidth = doc.width.as('px');
          var docHeight = doc.height.as('px');
          
          var scale = Math.max(newWidth / docWidth, newHeight / docHeight);
          doc.resizeImage(docWidth * scale, docHeight * scale, doc.resolution, ResampleMethod.BICUBIC);
          
          docWidth = doc.width.as('px');
          docHeight = doc.height.as('px');
          var left = (docWidth - newWidth) / 2;
          var top = (docHeight - newHeight) / 2;
          doc.crop([left, top, left + newWidth, top + newHeight]);
          
          var outputFile = new File("${outputPath.replace(/\\/g, '\\\\')}");
          doc.saveAs(outputFile, new PNGSaveOptions(), true);
          doc.close(SaveOptions.DONOTSAVECHANGES);
        }
      `;
    }).join('\n');
    
    const jsx = fileProcessing;
    
    runPhotoshopScript(jsx, (output) => res.json({ 
      result: `Processed ${files.length} images`, 
      files: files.map(f => f.name),
      output 
    }));
  } else {
    res.status(404).json({ error: "Tool not found" });
  }
});

app.listen(3000, () => console.log("Photoshop MCP server running on http://localhost:3000/mcp"));
