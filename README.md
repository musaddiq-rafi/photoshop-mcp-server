# Photoshop MCP Server

A powerful Express.js server that enables programmatic control of Adobe Photoshop through the Model Context Protocol (MCP). This server acts as a bridge between HTTP requests and Photoshop's ExtendScript engine, allowing you to automate Photoshop tasks via simple API calls.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Create Image](#create-image)
  - [Add Text](#add-text)
  - [Batch Crop](#batch-crop)
- [Usage Examples](#usage-examples)
  - [PowerShell Examples](#powershell-examples)
  - [cURL Examples](#curl-examples)
  - [JavaScript/Node.js Examples](#javascriptnodejs-examples)
  - [Python Examples](#python-examples)
- [Demo Walkthrough](#demo-walkthrough)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Extending the Server](#extending-the-server)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Features

- **REST API Interface** - Control Photoshop through simple HTTP POST requests
- **Create Documents** - Programmatically create new Photoshop documents with custom dimensions and colors
- **Add Text Layers** - Add text layers to existing documents with customizable font sizes
- **Batch Processing** - Automatically process multiple images from a folder (crop, resize, export)
- **ExtendScript Integration** - Leverages Photoshop's powerful JSX scripting engine
- **Auto-Save** - Automatically saves created images to PNG format
- **Hot Reload** - Development server with automatic restart on file changes
- **MCP Compatible** - Designed for Model Context Protocol integration with AI assistants

---

## Architecture

```
┌─────────────────┐     HTTP POST      ┌─────────────────┐
│                 │  ───────────────►  │                 │
│   Client/AI     │                    │  Express Server │
│   Application   │  ◄───────────────  │   (port 3000)   │
│                 │     JSON Response  │                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ Writes JSX Script
                                                ▼
                                       ┌─────────────────┐
                                       │                 │
                                       │   jsx/ folder   │
                                       │ (tempScript.jsx)│
                                       │                 │
                                       └────────┬────────┘
                                                │
                                                │ Executes via CLI
                                                ▼
                                       ┌─────────────────┐
                                       │                 │
                                       │ Adobe Photoshop │
                                       │                 │
                                       └─────────────────┘
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | v18.0.0 or higher | [Download Node.js](https://nodejs.org/) |
| **npm** | v9.0.0 or higher | Comes with Node.js |
| **Adobe Photoshop** | CC 2020 or later | Tested on Photoshop 2022 |
| **Windows** | 10/11 | macOS support requires path modifications |

### Verify Node.js Installation

```bash
node --version
# Expected output: v18.x.x or higher

npm --version
# Expected output: 9.x.x or higher
```

---

## Installation

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd photoshop-mcp

# Or simply navigate to the project directory
cd "D:\Tyger Media\Photoshop MCP"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install the following packages:
- `express` (v5.2.1) - Web framework for Node.js
- `body-parser` (v2.2.1) - Parse incoming request bodies

### Step 3: Verify Installation

```bash
# Check that node_modules exists
dir node_modules

# You should see express and body-parser folders
```

---

## Configuration

### Finding Your Photoshop Installation Path

Before running the server, you need to configure the correct path to your Photoshop installation.

#### Method 1: PowerShell Search

```powershell
Get-ChildItem "C:\Program Files\Adobe" -Filter "Photoshop.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

#### Method 2: Common Installation Paths

| Photoshop Version | Typical Path |
|-------------------|--------------|
| Photoshop 2025 | `C:\Program Files\Adobe\Adobe Photoshop 2025\Photoshop.exe` |
| Photoshop 2024 | `C:\Program Files\Adobe\Adobe Photoshop 2024\Photoshop.exe` |
| Photoshop 2023 | `C:\Program Files\Adobe\Adobe Photoshop 2023\Photoshop.exe` |
| Photoshop 2022 | `C:\Program Files\Adobe\Adobe Photoshop 2022\Photoshop.exe` |
| Photoshop CC 2021 | `C:\Program Files\Adobe\Adobe Photoshop 2021\Photoshop.exe` |

#### Method 3: From Photoshop Application

1. Open Adobe Photoshop
2. Go to **Help** → **System Info**
3. The application path is displayed at the top

### Update the Configuration

Edit `server.js` and update line 27 with your Photoshop path:

```javascript
const photoshopPath = `"C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Photoshop.exe"`;
```

> ⚠️ **Important**: Use double backslashes (`\\`) to escape the path in JavaScript strings.

---

## Running the Server

### Development Mode (with hot reload)

```bash
npm run dev
```

This uses Node.js's built-in `--watch` flag to automatically restart the server when you make changes to the code.

### Production Mode

```bash
npm start
```

### Custom Port

```powershell
# PowerShell
$env:PORT=4000; npm run dev

# Command Prompt
set PORT=4000 && npm run dev
```

### Expected Output

```
Photoshop MCP server running on http://localhost:3000/mcp
```

---

## API Reference

### Base URL

```
http://localhost:3000
```

### Health Check

Check if the server is running.

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /mcp` |
| **Response** | JSON |

#### Request

```http
GET /mcp HTTP/1.1
Host: localhost:3000
```

#### Response

```json
{
  "message": "Photoshop MCP server running"
}
```

---

### Create Image

Create a new Photoshop document with specified dimensions and background color.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /mcp` |
| **Content-Type** | `application/json` |

#### Request Body

```json
{
  "tool": "createImage",
  "args": {
    "width": 800,
    "height": 600,
    "color": {
      "red": 255,
      "green": 255,
      "blue": 255
    }
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tool` | string | Yes | Must be `"createImage"` |
| `args.width` | number | Yes | Document width in pixels |
| `args.height` | number | Yes | Document height in pixels |
| `args.color.red` | number | No | Red channel (0-255), default: 255 |
| `args.color.green` | number | No | Green channel (0-255), default: 255 |
| `args.color.blue` | number | No | Blue channel (0-255), default: 255 |

#### Response

```json
{
  "result": "Image created",
  "output": ""
}
```

#### Output File

The created image is automatically saved to:
```
<project-directory>/output.png
```

---

### Add Text

Add a text layer to the currently active Photoshop document.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /mcp` |
| **Content-Type** | `application/json` |

#### Request Body

```json
{
  "tool": "addText",
  "args": {
    "text": "Hello World",
    "fontSize": 48
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tool` | string | Yes | Must be `"addText"` |
| `args.text` | string | Yes | The text content to add |
| `args.fontSize` | number | Yes | Font size in points |

#### Response

```json
{
  "result": "Text added",
  "output": ""
}
```

> ⚠️ **Note**: This tool requires an open document in Photoshop. Use `createImage` first or have a document already open.

---

### Batch Crop

Automatically fetch the latest images from a folder, crop/resize them to specified dimensions, and export to another folder.

| Property | Value |
|----------|-------|
| **Endpoint** | `POST /mcp` |
| **Content-Type** | `application/json` |

#### Request Body

```json
{
  "tool": "batchCrop",
  "args": {
    "inputFolder": "C:\\Users\\YOGA\\Downloads",
    "outputFolder": "C:\\Users\\YOGA\\Pictures\\Cropped",
    "width": 1000,
    "height": 1000,
    "count": 5
  }
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tool` | string | Yes | - | Must be `"batchCrop"` |
| `args.inputFolder` | string | Yes | - | Path to folder containing source images |
| `args.outputFolder` | string | Yes | - | Path to folder where cropped images will be saved |
| `args.width` | number | No | 1000 | Target width in pixels |
| `args.height` | number | No | 1000 | Target height in pixels |
| `args.count` | number | No | 5 | Number of latest images to process |

#### Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.tiff`
- `.psd`

#### Response

```json
{
  "result": "Processed 5 images",
  "files": [
    "photo1.jpg",
    "photo2.png",
    "screenshot.jpg",
    "image4.png",
    "download.jpg"
  ],
  "output": ""
}
```

#### Output Files

Cropped images are saved with the naming pattern:
```
cropped_1_originalname.png
cropped_2_originalname.png
...
```

#### How It Works

1. 📂 Scans the `inputFolder` for image files
2. 🕐 Sorts images by **modification time** (newest first)
3. ✂️ Takes the latest N images (based on `count`)
4. 📐 Resizes each image proportionally to cover the target dimensions
5. 🎯 Crops from center to exact `width` × `height`
6. 💾 Exports as PNG to `outputFolder`
7. 📋 Returns list of processed files

---

## Usage Examples

### PowerShell Examples

#### Check Server Status

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" -Method Get
```

#### Create a New Image

```powershell
# Create an 800x600 image with a blue background
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tool": "createImage", "args": {"width": 800, "height": 600, "color": {"red": 50, "green": 100, "blue": 200}}}'
```

#### Create Image with Variables

```powershell
$body = @{
    tool = "createImage"
    args = @{
        width = 1920
        height = 1080
        color = @{
            red = 30
            green = 30
            blue = 30
        }
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

#### Add Text to Document

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tool": "addText", "args": {"text": "Hello from MCP!", "fontSize": 72}}'
```

#### Batch Crop Latest Images

```powershell
# Process latest 5 images from Downloads, crop to 1000x1000, save to Pictures\Cropped
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{
    "tool": "batchCrop",
    "args": {
      "inputFolder": "C:\\Users\\YOGA\\Downloads",
      "outputFolder": "C:\\Users\\YOGA\\Pictures\\Cropped",
      "width": 1000,
      "height": 1000,
      "count": 5
    }
  }'
```

#### Batch Crop with Variables

```powershell
$body = @{
    tool = "batchCrop"
    args = @{
        inputFolder = "C:\Users\YOGA\Downloads"
        outputFolder = "C:\Users\YOGA\Pictures\Cropped"
        width = 1080
        height = 1080
        count = 10
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

### cURL Examples

#### Check Server Status

```bash
curl http://localhost:3000/mcp
```

#### Create a New Image

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "createImage", "args": {"width": 800, "height": 600, "color": {"red": 255, "green": 200, "blue": 100}}}'
```

#### Add Text to Document

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "addText", "args": {"text": "Automated Text Layer", "fontSize": 36}}'
```

#### Batch Crop Latest Images

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "batchCrop",
    "args": {
      "inputFolder": "C:\\Users\\YOGA\\Downloads",
      "outputFolder": "C:\\Users\\YOGA\\Pictures\\Cropped",
      "width": 1000,
      "height": 1000,
      "count": 5
    }
  }'
```

---

### JavaScript/Node.js Examples

#### Using Fetch API

```javascript
// Create an image
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tool: 'createImage',
    args: {
      width: 1024,
      height: 768,
      color: { red: 45, green: 45, blue: 45 }
    }
  })
});

const result = await response.json();
console.log(result);
```

#### Using Axios

```javascript
const axios = require('axios');

// Add text to document
axios.post('http://localhost:3000/mcp', {
  tool: 'addText',
  args: {
    text: 'Created with Node.js',
    fontSize: 48
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

#### Batch Crop Images

```javascript
const response = await fetch('http://localhost:3000/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tool: 'batchCrop',
    args: {
      inputFolder: 'C:\\Users\\YOGA\\Downloads',
      outputFolder: 'C:\\Users\\YOGA\\Pictures\\Cropped',
      width: 1000,
      height: 1000,
      count: 5
    }
  })
});

const result = await response.json();
console.log(`Processed files:`, result.files);
```

---

### Python Examples

#### Using Requests Library

```python
import requests

# Create an image
response = requests.post('http://localhost:3000/mcp', json={
    'tool': 'createImage',
    'args': {
        'width': 1920,
        'height': 1080,
        'color': {
            'red': 20,
            'green': 20,
            'blue': 40
        }
    }
})

print(response.json())
```

#### Add Text

```python
import requests

response = requests.post('http://localhost:3000/mcp', json={
    'tool': 'addText',
    'args': {
        'text': 'Python Automation',
        'fontSize': 64
    }
})

print(response.json())
```

#### Batch Crop Images

```python
import requests

response = requests.post('http://localhost:3000/mcp', json={
    'tool': 'batchCrop',
    'args': {
        'inputFolder': 'C:\\Users\\YOGA\\Downloads',
        'outputFolder': 'C:\\Users\\YOGA\\Pictures\\Cropped',
        'width': 1000,
        'height': 1000,
        'count': 5
    }
})

result = response.json()
print(f"Processed {len(result['files'])} images:")
for file in result['files']:
    print(f"  - {file}")
```

---

## Demo Walkthrough

Follow these steps to see the Photoshop MCP server in action:

### Step 1: Start the Server

```powershell
npm run dev
```

You should see:
```
Photoshop MCP server running on http://localhost:3000/mcp
```

### Step 2: Verify Server is Running

Open a new terminal and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" -Method Get
```

Expected response:
```
message
-------
Photoshop MCP server running
```

### Step 3: Create a New Document

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tool": "createImage", "args": {"width": 800, "height": 600, "color": {"red": 50, "green": 100, "blue": 200}}}'
```

**What happens:**
1. Server receives the request
2. Generates a JSX script in the `jsx/` folder
3. Launches Photoshop with the script
4. Photoshop creates an 800x600 document
5. Sets the background color to blue (RGB: 50, 100, 200)
6. Saves the file as `output.png`

### Step 4: Add Text to the Document

Wait for Photoshop to fully open, then run:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tool": "addText", "args": {"text": "Hello MCP!", "fontSize": 72}}'
```

**What happens:**
1. Server generates a text-adding JSX script
2. Photoshop adds a new text layer
3. Sets the text content to "Hello MCP!"
4. Sets the font size to 72pt

### Step 5: Check the Output

- Look in your project folder for `output.png`
- Check Photoshop for the document with the text layer

---

## How It Works

### Request Flow

1. **Client sends HTTP POST** to `/mcp` with JSON body containing `tool` and `args`

2. **Server parses the request** and determines which tool to execute

3. **JSX Script Generation** - The server dynamically creates an ExtendScript (JSX) file based on the requested operation

4. **Script Execution** - The server executes Photoshop with the `-r` flag to run the JSX script:
   ```
   Photoshop.exe -r "path/to/tempScript.jsx"
   ```

5. **Photoshop Processing** - Photoshop launches (or uses existing instance) and executes the script

6. **Response** - Server returns JSON response with the result

### ExtendScript (JSX)

Photoshop uses ExtendScript, an Adobe-specific JavaScript variant, for automation. Example generated scripts:

#### Create Image Script

```javascript
var doc = app.documents.add(800, 600);
app.backgroundColor.rgb.red = 50;
app.backgroundColor.rgb.green = 100;
app.backgroundColor.rgb.blue = 200;
doc.saveAs(new File("D:/project/output.png"), new PNGSaveOptions(), true);
```

#### Add Text Script

```javascript
if(app.documents.length > 0){
  var doc = app.activeDocument;
  var layer = doc.artLayers.add();
  layer.kind = LayerKind.TEXT;
  layer.textItem.contents = "Hello World";
  layer.textItem.size = 48;
}
```

#### Batch Crop Script

```javascript
var inputFile = new File("C:/Users/YOGA/Downloads/photo.jpg");
if (inputFile.exists) {
  var doc = app.open(inputFile);
  
  var newWidth = 1000;
  var newHeight = 1000;
  var docWidth = doc.width.as('px');
  var docHeight = doc.height.as('px');
  
  // Scale proportionally to cover target size
  var scale = Math.max(newWidth / docWidth, newHeight / docHeight);
  doc.resizeImage(docWidth * scale, docHeight * scale, doc.resolution, ResampleMethod.BICUBIC);
  
  // Crop from center
  docWidth = doc.width.as('px');
  docHeight = doc.height.as('px');
  var left = (docWidth - newWidth) / 2;
  var top = (docHeight - newHeight) / 2;
  doc.crop([left, top, left + newWidth, top + newHeight]);
  
  // Export and close
  var outputFile = new File("C:/Users/YOGA/Pictures/Cropped/output.png");
  doc.saveAs(outputFile, new PNGSaveOptions(), true);
  doc.close(SaveOptions.DONOTSAVECHANGES);
}
```

---

## Project Structure

```
photoshop-mcp/
├── server.js          # Main Express server
├── package.json       # Project dependencies and scripts
├── jsx/               # Generated JSX scripts (auto-created)
│   └── tempScript.jsx # Temporary script file
├── output.png         # Generated images (when using createImage)
├── node_modules/      # Installed dependencies
└── README.md          # This documentation
```

---

## Troubleshooting

### Common Issues

#### 1. "npm run dev" doesn't work

**Problem:** Missing scripts in `package.json`

**Solution:** Ensure your `package.json` has the scripts section:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}
```

---

#### 2. Photoshop doesn't open

**Problem:** Incorrect Photoshop path

**Solution:** 
1. Find your Photoshop installation:
   ```powershell
   Get-ChildItem "C:\Program Files\Adobe" -Filter "Photoshop.exe" -Recurse
   ```
2. Update line 27 in `server.js` with the correct path

---

#### 3. "EADDRINUSE" error

**Problem:** Port 3000 is already in use

**Solution:** Either:
- Stop the other process using port 3000
- Use a different port:
  ```powershell
  $env:PORT=4000; npm run dev
  ```

---

#### 4. Text not appearing

**Problem:** No document is open in Photoshop

**Solution:** The `addText` tool requires an existing document. Either:
- Use `createImage` first
- Manually open a document in Photoshop

---

#### 5. "Cannot find module" error

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

#### 6. Script runs but nothing happens in Photoshop

**Problem:** The `-r` flag may not work on all Photoshop versions

**Solution:** 
1. Open Photoshop manually first
2. Go to **File** → **Scripts** → **Browse**
3. Navigate to `jsx/tempScript.jsx`
4. Run the script manually

Alternative: Use the Photoshop Actions panel or configure remote scripting.

---

#### 7. PowerShell JSON escaping issues

**Problem:** Complex JSON bodies fail in PowerShell

**Solution:** Use a variable:
```powershell
$body = @{
    tool = "createImage"
    args = @{
        width = 800
        height = 600
        color = @{ red = 255; green = 255; blue = 255 }
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/mcp" -Method Post -ContentType "application/json" -Body $body
```

---

## Extending the Server

### Adding a New Tool

To add a new Photoshop automation tool:

1. **Add a new condition** in the `app.post("/mcp")` handler:

```javascript
} else if (tool === "applyFilter") {
  const { filterName } = args;
  const jsx = `
    if(app.documents.length > 0){
      var doc = app.activeDocument;
      // Apply Gaussian Blur
      doc.activeLayer.applyGaussianBlur(${args.radius || 5});
    }
  `;
  runPhotoshopScript(jsx, (output) => res.json({ result: "Filter applied", output }));
}
```

2. **Test your new tool**:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tool": "applyFilter", "args": {"filterName": "gaussianBlur", "radius": 10}}'
```

### Useful ExtendScript References

| Resource | URL |
|----------|-----|
| Photoshop Scripting Guide | Adobe Developer Documentation |
| ExtendScript API Reference | Built into ExtendScript Toolkit |
| Photoshop DOM Reference | `app`, `documents`, `layers`, etc. |

### Example Tools You Could Add

- **Resize Image** - Change document dimensions
- **Apply Filters** - Blur, sharpen, etc.
- **Adjust Colors** - Hue/saturation, levels
- **Export Layers** - Save layers as separate files
- **Batch Processing** - Process multiple files
- **Smart Object** - Create/update smart objects

---

## Security Considerations

⚠️ **Warning**: This server executes system commands and runs scripts in Photoshop. Consider the following:

1. **Local Use Only** - Do not expose this server to the public internet
2. **Input Validation** - Add validation for all input parameters
3. **Path Sanitization** - Be careful with file paths to prevent directory traversal
4. **Rate Limiting** - Consider adding rate limiting for production use

### Recommended Security Additions

```javascript
// Add input validation
if (typeof width !== 'number' || width < 1 || width > 10000) {
  return res.status(400).json({ error: "Invalid width" });
}

// Sanitize text input
const sanitizedText = text.replace(/["\\\n\r]/g, '');
```

---

## License

This project is provided as-is for educational and personal use.

---

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Photoshop's ExtendScript documentation
3. Ensure all prerequisites are installed correctly

---

**Happy Automating!** 🎨

#   p h o t o s h o p - m c p - s e r v e r  
 