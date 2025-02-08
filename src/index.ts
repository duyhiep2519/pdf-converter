import { createWorker, createScheduler } from 'tesseract.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const pdfPath = 'src/test.pdf';
const outputDir = 'output-images';
const resultDir = 'output-results';

const convertPdfToImages = (pdfPath: string) => {
    return new Promise<void>((resolve, reject) => {
        const outputPrefix = path.join(outputDir, 'page');
        const command = `pdftoppm -r 300 -png ${pdfPath} ${outputPrefix}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(`Error converting PDF: ${stderr}`);
            }
            console.log('PDF converted to images successfully.');
            resolve();
        });
    });
};

const performOCR = async (imagePath: string) => {
    const worker = await createWorker('vie');

    await worker.load();

    try {
        const { data } = await worker.recognize(imagePath);
        const resultPath = path.join(
            resultDir,
            path.basename(imagePath, '.png') + '.txt',
        );
        fs.writeFileSync(resultPath, data.text);
        console.log('OCR result saved to:', resultPath);
    } catch (err) {
        console.error('Error during OCR:', err);
    } finally {
        await worker.terminate();
    }
};

const readPdfWithOCR = async () => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    await convertPdfToImages(pdfPath);

    const imageFiles = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.png'));
    for (const imageFile of imageFiles) {
        const imagePath = path.join(outputDir, imageFile);
        await performOCR(imagePath);
    }
};

readPdfWithOCR();
