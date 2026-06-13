const fs = require('fs');
const path = require('path');

try {
  console.log('Building single-file digital clock...');

  // Read files
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const fontPath = path.join(__dirname, 'assets/fonts/ChivoMono-VariableFont.ttf');
  
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at ${fontPath}. Please run Task 1 first.`);
  }
  const font = fs.readFileSync(fontPath);

  // Encode font to base64
  const fontBase64 = font.toString('base64');
  const fontDataUri = `data:font/ttf;base64,${fontBase64}`;

  // Replace font url in CSS
  const inlineCss = css.replace("url('assets/fonts/ChivoMono-VariableFont.ttf')", `url('${fontDataUri}')`);

  // Replace CSS link in HTML
  let inlineHtml = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${inlineCss}\n</style>`);

  // Replace JS script link in HTML
  inlineHtml = inlineHtml.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

  // Write to index_single.html
  const outputPath = path.join(__dirname, 'index_single.html');
  fs.writeFileSync(outputPath, inlineHtml, 'utf8');
  console.log(`Successfully generated self-contained single-file: ${outputPath}`);
} catch (err) {
  console.error('Build failed:', err.message);
  process.exit(1);
}
