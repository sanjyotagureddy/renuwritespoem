const fs = require('fs');
const path = require('path');

const baseDir = 'e:\\Projects\\renuwritespoem';

function replaceInFile(filepath, pattern, replacement) {
    const fullPath = path.join(baseDir, filepath);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
    }
}

// Fix "catch (err) {" -> "catch {"
const files = [
    "src/app/forgot-password/forgot-form.tsx",
    "src/app/login/login-form.tsx",
    "src/app/reset-password/reset-form.tsx",
    "src/app/signup/signup-form.tsx",
];
files.forEach(f => replaceInFile(f, /catch\s*\(err\)/g, 'catch'));

// Fix unused imports
replaceInFile("src/app/page.tsx", /import AuthorProfile from "@\/components\/home\/author-profile";\n?/g, '');
replaceInFile("src/components/account/achievement-badges.tsx", /import { Badge } from "@\/components\/ui\/badge";\n?/g, '');
replaceInFile("src/components/account/achievement-tracker.tsx", /const\s*{\s*data:\s*session\s*}\s*=\s*useSession\(\);\n?/g, '');

// Fix unused eslint-disable directive
replaceInFile("src/app/books/[slug]/opengraph-image.tsx", /\/\/ eslint-disable-next-line @next\/next\/no-img-element\n/g, '');

// For image tags, let's just insert the disable comment if it's missing
replaceInFile("src/app/admin/users/page.tsx", /(<img\s+src=\{generateAvatarUrl)/g, '// eslint-disable-next-line @next/next/no-img-element\n                            $1');
replaceInFile("src/app/admin/users/[id]/page.tsx", /(<img\s+src=\{user\.image \|\| generateAvatarUrl)/g, '// eslint-disable-next-line @next/next/no-img-element\n              $1');
replaceInFile("src/components/home/testimonials-section.tsx", /(<img\s+src=\{generateAvatarUrl)/g, '// eslint-disable-next-line @next/next/no-img-element\n                      $1');
replaceInFile("src/components/ui/comment-section/comment-item.tsx", /(<img\s+src=\{comment\.user\.image)/g, '// eslint-disable-next-line @next/next/no-img-element\n            $1');
replaceInFile("src/components/ui/like-button.tsx", /(<img\s+src=\{like\.user\.image \|\| generateAvatarUrl)/g, '// eslint-disable-next-line @next/next/no-img-element\n                      $1');

// Fix unused sendCampaignEmailBcc warning
replaceInFile("src/app/admin/actions/campaign-actions.ts", /export async function sendCampaignEmailBcc/g, 'async function sendCampaignEmailBcc');

console.log("Done");
