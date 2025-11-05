#!/bin/bash
# Compress images in the input directory to webp format
# Example: ./scripts/compress-images.sh ./public/img false
# Example: ./scripts/compress-images.sh ./public/projects/scout true

# Param 1: Input directory (default: ../public/img)
# Param 2: Delete originals (default: false)
INPUT_DIR="${1:-../public/img}"
DELETE_ORIGINALS="${2:-false}"

# Check if input directory exists
if [ ! -d "$INPUT_DIR" ]; then
    echo "Error: Input directory $INPUT_DIR does not exist"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (magick) is not installed"
    echo "Please install ImageMagick to use this script"
    exit 1
fi

# Supported image formats
SUPPORTED_FORMATS=("jpg" "jpeg" "png" "bmp" "tiff" "tif")

echo "Processing images in: $INPUT_DIR"
echo "Delete originals: $DELETE_ORIGINALS"

# Function to get file extension
get_extension() {
    local filename="$1"
    echo "${filename##*.}" | tr '[:upper:]' '[:lower:]'
}

# Function to check if file is a supported image
is_supported_image() {
    local file="$1"
    local ext=$(get_extension "$file")
    
    for format in "${SUPPORTED_FORMATS[@]}"; do
        if [ "$ext" = "$format" ]; then
            return 0
        fi
    done
    return 1
}

# Process each file in the directory
for file in "$INPUT_DIR"/*; do
    # Skip if not a file or not a directory
    if [ ! -f "$file" ]; then
        continue
    fi

    filename=$(basename -- "$file")
    
    # Check if file is a supported image format
    if ! is_supported_image "$file"; then
        echo "Skipping $filename (unsupported format)"
        continue
    fi

    echo "Processing $filename..."

    # Get filename without extension
    name="${filename%.*}"
    ext=$(get_extension "$filename")
    
    # Create temporary files for comparison
    lossy_file="${INPUT_DIR}/${name}_lossy.webp"
    lossless_file="${INPUT_DIR}/${name}_lossless.webp"
    final_file="${INPUT_DIR}/${name}.webp"

    # Create lossy version
    echo "  Creating lossy version..."
    magick "$file" -quality 75 "$lossy_file"
    
    # Create lossless version
    echo "  Creating lossless version..."
    magick "$file" -define webp:lossless=true "$lossless_file"
    
    # Get file sizes
    lossy_size=$(stat -f%z "$lossy_file" 2>/dev/null || stat -c%s "$lossy_file" 2>/dev/null || echo "0")
    lossless_size=$(stat -f%z "$lossless_file" 2>/dev/null || stat -c%s "$lossless_file" 2>/dev/null || echo "0")
    
    echo "  Lossy size: ${lossy_size} bytes"
    echo "  Lossless size: ${lossless_size} bytes"
    
    # Keep the smaller file
    if [ "$lossy_size" -lt "$lossless_size" ] && [ "$lossy_size" -gt 0 ]; then
        echo "  Keeping lossy version (smaller)"
        mv "$lossy_file" "$final_file"
        rm -f "$lossless_file"
    else
        echo "  Keeping lossless version (smaller or lossy failed)"
        mv "$lossless_file" "$final_file"
        rm -f "$lossy_file"
    fi
    
    # Delete original if requested
    if [ "$DELETE_ORIGINALS" = "true" ] || [ "$DELETE_ORIGINALS" = "1" ]; then
        echo "  Deleting original file"
        rm "$file"
    fi
    
    echo "  Completed: $filename -> ${name}.webp"
    echo ""
done

echo "Image compression done" 