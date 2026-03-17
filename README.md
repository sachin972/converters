# JSON to CSV Converter

A simple frontend tool to convert JSON (array of objects) to CSV. Paste JSON or open a `.json` file, then convert and download the result.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Usage

- **JSON input**: Paste valid JSON in the left panel, or use "Open file" to load a `.json` file.
- **Convert**: Click "Convert" to generate CSV from the JSON array (or single object).
- **Download**: After conversion, use "Download CSV" to save the file.

The converter supports arrays of objects; nested objects and arrays are stringified in the CSV.
