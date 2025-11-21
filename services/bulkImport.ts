import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { supabase } from './supabase';
import { Product } from '../types';

export interface BulkImportResult {
    success: number;
    failed: number;
    errors: string[];
}

export const parseAndImport = async (
    excelFile: File,
    zipFile: File | null,
    onProgress: (msg: string) => void
): Promise<BulkImportResult> => {
    const result: BulkImportResult = { success: 0, failed: 0, errors: [] };

    try {
        // 1. Parse Excel
        onProgress("Reading Excel file...");
        const data = await excelFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        if (!rows || rows.length === 0) {
            throw new Error("Excel file is empty");
        }

        // 2. Prepare Zip (if provided)
        let zipImages: { [key: string]: Blob } = {};
        if (zipFile) {
            onProgress("Reading Zip file...");
            const zip = await JSZip.loadAsync(zipFile);

            // Iterate through all files in zip
            for (const [filename, file] of Object.entries(zip.files)) {
                if (!file.dir && !filename.startsWith('__MACOSX') && !filename.startsWith('.')) {
                    // Extract filename without path
                    const cleanName = filename.split('/').pop();
                    if (cleanName) {
                        const blob = await file.async('blob');
                        zipImages[cleanName] = blob;
                    }
                }
            }
        }

        // 3. Process Rows
        onProgress(`Processing ${rows.length} products...`);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 2; // Excel row number (1-header)

            try {
                // Validate required fields
                if (!row.nameCN || !row.priceUnit) {
                    throw new Error(`Row ${rowIndex}: Missing nameCN or priceUnit`);
                }

                let imageUrl = row.imageUrl || 'https://via.placeholder.com/300';

                // Determine filename from either imageFilename or imageUrl (if it looks like a filename)
                const potentialFilename = row.imageFilename || (row.imageUrl && !row.imageUrl.startsWith('http') ? row.imageUrl : null);

                // Handle Image Upload from Zip
                if (zipFile && potentialFilename && zipImages[potentialFilename]) {
                    onProgress(`Uploading image for ${row.nameCN}...`);
                    const imageBlob = zipImages[potentialFilename];
                    const storagePath = `bulk_${Date.now()}_${potentialFilename}`;

                    if (supabase) {
                        // Detect file extension for Content-Type
                        const fileExt = potentialFilename.split('.').pop()?.toLowerCase() || 'jpg';
                        const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('products')
                            .upload(storagePath, imageBlob, {
                                contentType: contentType,
                                upsert: true
                            });

                        if (uploadError) throw uploadError;

                        // Get Public URL
                        const { data: publicUrlData } = supabase.storage
                            .from('products')
                            .getPublicUrl(storagePath);

                        imageUrl = publicUrlData.publicUrl;
                    }
                }

                const newProduct: Partial<Product> = {
                    nameCN: row.nameCN,
                    nameFR: row.nameFR || row.nameCN,
                    department: row.department || 'Épicerie / 杂货',
                    priceUnit: parseFloat(row.priceUnit),
                    priceCase: parseFloat(row.priceCase || 0),
                    taxable: row.taxable === true || row.taxable === 'TRUE' || row.taxable === 1,
                    imageUrl: imageUrl,
                    stock: parseInt(row.stock || '100')
                };

                // Insert to DB
                if (supabase) {
                    const { error: insertError } = await supabase
                        .from('products')
                        .insert({
                            name_cn: newProduct.nameCN,
                            name_fr: newProduct.nameFR,
                            department: newProduct.department,
                            price_unit: newProduct.priceUnit,
                            price_case: newProduct.priceCase,
                            taxable: newProduct.taxable,
                            image_url: newProduct.imageUrl,
                            stock: newProduct.stock
                        });

                    if (insertError) throw insertError;
                }

                result.success++;
            } catch (err: any) {
                console.error(err);
                result.failed++;
                result.errors.push(err.message || `Error on row ${rowIndex}`);
            }

            if (i % 5 === 0) {
                onProgress(`Processed ${i + 1}/${rows.length}...`);
            }
        }

    } catch (err: any) {
        result.errors.push(`Fatal Error: ${err.message}`);
    }

    return result;
};
