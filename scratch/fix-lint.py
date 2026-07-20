import os
import re

base_dir = r"e:\Projects\renuwritespoem"

def replace_in_file(filepath, pattern, replacement):
    full_path = os.path.join(base_dir, filepath)
    if not os.path.exists(full_path):
        return
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(new_content)

# Fix "catch (err) {" -> "catch {"
for file in [
    "src/app/forgot-password/forgot-form.tsx",
    "src/app/login/login-form.tsx",
    "src/app/reset-password/reset-form.tsx",
    "src/app/signup/signup-form.tsx",
]:
    replace_in_file(file, r'catch\s*\(err\)', 'catch')

# Fix unused imports
replace_in_file("src/app/page.tsx", r'import AuthorProfile from "@/components/home/author-profile";\n?', '')
replace_in_file("src/components/account/achievement-badges.tsx", r'import { Badge } from "@/components/ui/badge";\n?', '')
replace_in_file("src/components/account/achievement-tracker.tsx", r'const\s*{\s*data:\s*session\s*}\s*=\s*useSession\(\);\n?', '')

# Fix unused eslint-disable directive
replace_in_file("src/app/books/[slug]/opengraph-image.tsx", r'// eslint-disable-next-line @next/next/no-img-element\n', '')

# For image tags, let's just insert the disable comment if it's missing
# src/app/admin/users/page.tsx
replace_in_file("src/app/admin/users/page.tsx", r'(<img\s+src=\{generateAvatarUrl)', r'// eslint-disable-next-line @next/next/no-img-element\n                            \1')

# src/app/admin/users/[id]/page.tsx
replace_in_file("src/app/admin/users/[id]/page.tsx", r'(<img\s+src=\{user\.image \|\| generateAvatarUrl)', r'// eslint-disable-next-line @next/next/no-img-element\n              \1')

# src/components/home/testimonials-section.tsx
replace_in_file("src/components/home/testimonials-section.tsx", r'(<img\s+src=\{generateAvatarUrl)', r'// eslint-disable-next-line @next/next/no-img-element\n                      \1')

# src/components/ui/comment-section/comment-item.tsx
replace_in_file("src/components/ui/comment-section/comment-item.tsx", r'(<img\s+src=\{comment\.user\.image)', r'// eslint-disable-next-line @next/next/no-img-element\n            \1')

# src/components/ui/like-button.tsx
replace_in_file("src/components/ui/like-button.tsx", r'(<img\s+src=\{like\.user\.image \|\| generateAvatarUrl)', r'// eslint-disable-next-line @next/next/no-img-element\n                      \1')

# Fix src/app/admin/actions/campaign-actions.ts
replace_in_file("src/app/admin/actions/campaign-actions.ts", r'export async function sendCampaignEmailBcc', r'async function sendCampaignEmailBcc')

print("Done")
