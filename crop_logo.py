from PIL import Image
import os

image_path = "images/logomain.png"
if os.path.exists(image_path):
    try:
        img = Image.open(image_path)
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            # Crop to the bounding box
            cropped_img = img.crop(bbox)
            cropped_img.save(image_path)
            print("SUCCESS: Logo cropped successfully.")
        else:
            print("ERROR: Image appears to be completely empty.")
    except Exception as e:
        print(f"ERROR: Image processing failed: {e}")
else:
    print("ERROR: logomain.png not found.")
