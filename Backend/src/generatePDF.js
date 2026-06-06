import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('OpsMind_Test_Corporate_Manual.pdf'));

// Title Page
doc.fontSize(24).text('ABC Solutions Pvt. Ltd.', { align: 'center' });
doc.moveDown();
doc.fontSize(18).text('Comprehensive Corporate Operations Manual', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Confidential Internal Document - 2026 Edition', { align: 'center' });
doc.addPage();

// Helper function to generate large blocks of text
function generateFillerText(topic, paragraphs) {
    const sentences = [
        `The ${topic} must be strictly adhered to by all employees across all departments. `,
        `Failure to comply with the ${topic} guidelines may result in disciplinary action. `,
        `Management reserves the right to amend the ${topic} at any time without prior notice. `,
        `For further clarification on the ${topic}, please consult the HR portal. `,
        `All metrics related to ${topic} are audited quarterly by the compliance team. `,
        `Exceptions to the ${topic} require written approval from a Tier 3 manager. `
    ];

    let text = "";
    for (let i = 0; i < paragraphs; i++) {
        for (let j = 0; j < 15; j++) { // 15 sentences per paragraph
            text += sentences[Math.floor(Math.random() * sentences.length)];
        }
        text += "\n\n";
    }
    return text;
}

// Generate ~40 pages of content
const chapters = [
    { title: "Chapter 1: Company History & Vision", topic: "company vision" },
    { title: "Chapter 2: Code of Conduct & Ethics", topic: "code of conduct" },
    { title: "Chapter 3: IT Security & Device Usage", topic: "IT security policy" },
    { title: "Chapter 4: Leave, Attendance & Holidays", topic: "leave policy" },
    { title: "Chapter 5: Travel & Expense Reimbursement", topic: "reimbursement protocol" },
    { title: "Chapter 6: Performance Review Process", topic: "appraisal system" },
    { title: "Chapter 7: Client Communication Standards", topic: "communication standards" },
    { title: "Chapter 8: Workplace Safety & Emergency", topic: "safety protocol" }
];

chapters.forEach(chapter => {
    doc.fontSize(18).text(chapter.title, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(generateFillerText(chapter.topic, 10)); // Generates a lot of text

    // Inject a specific, testable fact into the middle of the noise!
    if (chapter.title.includes("Travel")) {
        doc.moveDown();
        doc.fontSize(12).text("CRITICAL POLICY UPDATE: The maximum daily food allowance during domestic travel is exactly 1,450 INR. Any expenses above this require a digital receipt uploaded to the Concur system within 48 hours.", { continued: false });
        doc.moveDown();
    }
    if (chapter.title.includes("Leave")) {
        doc.moveDown();
        doc.fontSize(12).text("SICK LEAVE POLICY: Employees are entitled to 14 days of paid sick leave per year. A medical certificate is mandatory if sick leave exceeds 3 consecutive days.", { continued: false });
        doc.moveDown();
    }

    doc.addPage();
});

// Final Page
doc.fontSize(16).text('End of Document.', { align: 'center' });

doc.end();
console.log("✅ PDF Generated successfully! Check your folder for OpsMind_Test_Corporate_Manual.pdf");