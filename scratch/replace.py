import os
import re

files_to_process = [
    "src/components/admin/analytics-tabs.tsx",
    "src/components/books/purchase-form.tsx",
    "src/components/books/book-purchase-layout.tsx",
    "src/app/page.tsx",
    "src/components/home/testimonials-section.tsx",
    "src/app/contact/page.tsx",
    "src/app/admin/error.tsx",
    "src/app/poems/error.tsx",
    "src/app/books/error.tsx",
]

base_dir = r"e:\Projects\renuwritespoem"

# We want to replace <div className="... border border-white/10 bg-white/[0.02] ..."> 
# or similar border/bg combinations with <GlassCard className="...">
# Since they vary slightly (border-white/15, bg-white/[0.01], rounded-2xl, rounded-3xl),
# we can use a regex to identify them.

pattern = re.compile(r'<div([^>]*)className="([^"]*(?:border border-white/\d+|bg-white/\[?0\.0\d\]?)[^"]*)"')

def replacer(match):
    prefix = match.group(1)
    classes_str = match.group(2)
    
    # Check if it has rounded-3xl, otherwise default 2xl
    rounded_prop = ""
    if "rounded-3xl" in classes_str:
        rounded_prop = ' rounded="3xl"'
    elif "rounded-xl" in classes_str:
        rounded_prop = ' rounded="xl"'
        
    hoverable_prop = ""
    if "hover:border-white" in classes_str or "hover:bg-white" in classes_str:
        hoverable_prop = " hoverable"

    # Remove standard glass classes from string to prevent redundancy
    # We will remove rounded-X, border, border-white/X, bg-white/X, transition-all, hover:border-white/X, hover:bg-white/X, backdrop-blur-X
    classes_list = classes_str.split()
    new_classes = []
    
    # Exceptions: if the card is a tinted card (emerald, sky, amber, etc.), we should keep its tinted border/bg, but we still use GlassCard
    # Wait, the regex only matched if it had border-white or bg-white. So these are standard cards.
    for c in classes_list:
        if c in ["border", "transition-all"]:
            continue
        if c.startswith("rounded-") and c in ["rounded-xl", "rounded-2xl", "rounded-3xl"]:
            continue
        if c.startswith("border-white/") or c.startswith("bg-white/"):
            continue
        if c.startswith("hover:border-white/") or c.startswith("hover:bg-white/"):
            continue
        if c.startswith("backdrop-blur"):
            continue
        new_classes.append(c)
        
    new_class_str = " ".join(new_classes)
    
    class_prop = f' className="{new_class_str}"' if new_class_str else ""
    return f'<GlassCard{prefix}{rounded_prop}{hoverable_prop}{class_prop}'

def close_tag_replacer(content):
    # This is tricky because we can't easily distinguish which </div> belongs to a GlassCard.
    # It's better to manually replace the components using `replace` or just do targeted replacements.
    pass

for filepath in files_to_process:
    full_path = os.path.join(base_dir, filepath)
    if not os.path.exists(full_path):
        continue
        
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # We will do explicit targeted replacements to avoid mismatched </div> tags!
    # Because if we blindly replace <div ...> with <GlassCard ...>, we'd have to find the matching </div> and replace it with </GlassCard>.
    pass
