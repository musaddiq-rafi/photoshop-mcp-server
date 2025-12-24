# Photoshop MCP Server API Documentation

API documentation for the Photoshop MCP Server with detailed Postman request and response examples.

---

## Base URL

```
http://localhost:3000
```

---

## Endpoints

### 1. Health Check

Check if the server is running.

#### Request

**Method:** `GET`  
**URL:** `http://localhost:3000/mcp`  
**Headers:** None  
**Body:** None

#### Postman Configuration

- **Method:** GET
- **URL:** `http://localhost:3000/mcp`
- **Headers:** (none required)
- **Body:** (none)

#### Response

**Status Code:** `200 OK`  
**Content-Type:** `application/json`

```json
{
  "message": "Photoshop MCP server running"
}
```

#### Response Details

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Confirmation message indicating the server is running |

---

### 2. Create Image

Create a new Photoshop document with specified dimensions and background color.

#### Request

**Method:** `POST`  
**URL:** `http://localhost:3000/mcp`  
**Content-Type:** `application/json`  
**Body:** JSON object

#### Postman Configuration

- **Method:** POST
- **URL:** `http://localhost:3000/mcp`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (raw JSON)

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

#### Request Parameters

| Parameter | Type | Required | Default | Description | Constraints |
|-----------|------|----------|---------|-------------|-------------|
| `tool` | string | Yes | - | Must be `"createImage"` | Must be exactly `"createImage"` |
| `args.width` | number | Yes | - | Document width in pixels | Must be a positive number |
| `args.height` | number | Yes | - | Document height in pixels | Must be a positive number |
| `args.color.red` | number | No | 255 | Red channel value | 0-255 |
| `args.color.green` | number | No | 255 | Green channel value | 0-255 |
| `args.color.blue` | number | No | 255 | Blue channel value | 0-255 |

#### Example Request

```json
{
  "tool": "createImage",
  "args": {
    "width": 1920,
    "height": 1080,
    "color": {
      "red": 50,
      "green": 100,
      "blue": 200
    }
  }
}
```

#### Response

**Status Code:** `200 OK`  
**Content-Type:** `application/json`

```json
{
  "result": "Image created",
  "output": ""
}
```

#### Response Details

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Success message indicating the image was created |
| `output` | string | Output from Photoshop script execution (usually empty) |

#### Output File

The created image is automatically saved to:
```
<project-directory>/output.png
```

**Note:** The file is saved as PNG format in the project root directory. Each new `createImage` request will overwrite the previous `output.png` file.

---

### 3. Add Text

Add a text layer to the currently active Photoshop document.

#### Request

**Method:** `POST`  
**URL:** `http://localhost:3000/mcp`  
**Content-Type:** `application/json`  
**Body:** JSON object

#### Postman Configuration

- **Method:** POST
- **URL:** `http://localhost:3000/mcp`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (raw JSON)

```json
{
  "tool": "addText",
  "args": {
    "text": "Hello World",
    "fontSize": 48
  }
}
```

#### Request Parameters

| Parameter | Type | Required | Default | Description | Constraints |
|-----------|------|----------|---------|-------------|-------------|
| `tool` | string | Yes | - | Must be `"addText"` | Must be exactly `"addText"` |
| `args.text` | string | Yes | - | The text content to add | Any string value |
| `args.fontSize` | number | Yes | - | Font size in points | Must be a positive number |

#### Example Request

```json
{
  "tool": "addText",
  "args": {
    "text": "Hello from MCP!",
    "fontSize": 72
  }
}
```

#### Response

**Status Code:** `200 OK`  
**Content-Type:** `application/json`

```json
{
  "result": "Text added",
  "output": ""
}
```

#### Response Details

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Success message indicating the text was added |
| `output` | string | Output from Photoshop script execution (usually empty) |

#### Important Notes

⚠️ **Prerequisites:**
- This tool requires an open document in Photoshop
- Use `createImage` first to create a document, or manually open a document in Photoshop
- If no document is open, the text will not be added (no error will be returned)

---

### 4. Batch Crop

Automatically fetch the latest images from a folder, crop/resize them to specified dimensions, and export to another folder.

#### Request

**Method:** `POST`  
**URL:** `http://localhost:3000/mcp`  
**Content-Type:** `application/json`  
**Body:** JSON object

#### Postman Configuration

- **Method:** POST
- **URL:** `http://localhost:3000/mcp`
- **Headers:**
  - `Content-Type: application/json`
- **Body:** (raw JSON)

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

#### Request Parameters

| Parameter | Type | Required | Default | Description | Constraints |
|-----------|------|----------|---------|-------------|-------------|
| `tool` | string | Yes | - | Must be `"batchCrop"` | Must be exactly `"batchCrop"` |
| `args.inputFolder` | string | Yes | - | Path to folder containing source images | Must be a valid Windows path |
| `args.outputFolder` | string | Yes | - | Path to folder where cropped images will be saved | Must be a valid Windows path |
| `args.width` | number | No | 1000 | Target width in pixels | Must be a positive number |
| `args.height` | number | No | 1000 | Target height in pixels | Must be a positive number |
| `args.count` | number | No | 5 | Number of latest images to process | Must be a positive number |

#### Example Request

```json
{
  "tool": "batchCrop",
  "args": {
    "inputFolder": "C:\\Users\\YOGA\\Downloads",
    "outputFolder": "C:\\Users\\YOGA\\Pictures\\Cropped",
    "width": 1080,
    "height": 1080,
    "count": 10
  }
}
```

#### Supported Image Formats

The following image formats are supported:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.bmp`
- `.tiff`
- `.psd`

#### Response

**Status Code:** `200 OK`  
**Content-Type:** `application/json`

**Success Response:**
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

**No Images Found Response:**
```json
{
  "result": "No images found in folder",
  "files": []
}
```

**Error Response:**
```json
{
  "error": "Cannot read input folder",
  "details": "ENOENT: no such file or directory"
}
```

#### Response Details

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Message indicating how many images were processed, or error message |
| `files` | array | Array of filenames that were processed (only on success) |
| `output` | string | Output from Photoshop script execution (usually empty) |
| `error` | string | Error message (only present on error) |
| `details` | string | Detailed error information (only present on error) |

#### Output Files

Cropped images are saved with the following naming pattern:
```
cropped_1_originalname.png
cropped_2_originalname.png
cropped_3_originalname.png
...
```

**File Naming Details:**
- Files are numbered sequentially starting from 1
- Original filename is preserved (extension changed to `.png`)
- All output files are saved as PNG format
- Files are saved in the `outputFolder` specified in the request

#### Processing Details

The batch crop operation performs the following steps:

1. **Scan Input Folder** - Scans the `inputFolder` for image files matching supported formats
2. **Sort by Date** - Sorts images by modification time (newest first)
3. **Select Latest** - Takes the latest N images based on the `count` parameter
4. **Resize Proportionally** - Resizes each image proportionally to cover the target dimensions (maintains aspect ratio)
5. **Crop from Center** - Crops from the center to exact `width` × `height` dimensions
6. **Export as PNG** - Exports each processed image as PNG format
7. **Save to Output** - Saves all processed images to the `outputFolder`

**Note:** If the output folder doesn't exist, it will be created automatically.

---

## Error Responses

### 404 Not Found

**Status Code:** `404 Not Found`  
**Content-Type:** `application/json`

```json
{
  "error": "Tool not found"
}
```

This error occurs when:
- The `tool` parameter is missing
- The `tool` parameter value is not one of: `createImage`, `addText`, or `batchCrop`

### 400 Bad Request

**Status Code:** `400 Bad Request`  
**Content-Type:** `application/json`

```json
{
  "error": "Cannot read input folder",
  "details": "ENOENT: no such file or directory"
}
```

This error occurs when:
- The `inputFolder` path in `batchCrop` doesn't exist
- The `inputFolder` path is invalid or inaccessible

---

## Postman Collection Setup

### Environment Variables (Optional)

You can create a Postman environment with the following variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `input_folder` | `C:\\Users\\YOGA\\Downloads` | `C:\\Users\\YOGA\\Downloads` |
| `output_folder` | `C:\\Users\\YOGA\\Pictures\\Cropped` | `C:\\Users\\YOGA\\Pictures\\Cropped` |

### Using Environment Variables in Requests

**Example for Batch Crop:**
```json
{
  "tool": "batchCrop",
  "args": {
    "inputFolder": "{{input_folder}}",
    "outputFolder": "{{output_folder}}",
    "width": 1000,
    "height": 1000,
    "count": 5
  }
}
```

---

## Request/Response Flow

1. **Client sends POST request** to `http://localhost:3000/mcp` with JSON body
2. **Server validates** the `tool` parameter and `args` structure
3. **Server generates JSX script** based on the tool type
4. **Server executes Photoshop** with the generated script
5. **Server returns JSON response** with result status and any output

**Processing Time:**
- `createImage`: Typically 2-5 seconds (depends on Photoshop startup time)
- `addText`: Typically 1-3 seconds
- `batchCrop`: Varies based on number of images (approximately 3-5 seconds per image)

---

## Notes

- All requests must use `Content-Type: application/json` header
- The server runs on port 3000 by default
- Photoshop must be installed and accessible at the configured path
- File paths must use Windows format with double backslashes (`\\`) in JSON strings
- The server processes requests synchronously (one at a time)
