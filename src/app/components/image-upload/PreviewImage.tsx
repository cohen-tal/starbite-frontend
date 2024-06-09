import { motion } from "framer-motion";
import Image from "next/image";
import { memo, useMemo } from "react";

interface PreviewImageProps {
  image: File;
  size: number;
  onDelete: () => void;
}

function PreviewImage({ image, size, onDelete }: PreviewImageProps) {
  const src = useMemo(() => URL.createObjectURL(image), [image]);

  return (
    <motion.div
      className={`flex flex-col items-center justify-center w-28 lg:w-full h-32 border-4 ${
        size > 3000000 ? "border-red-600" : ""
      } shadow`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1, ease: "easeIn" } }}
    >
      <div className="relative w-full h-32">
        <Image
          src={src}
          alt="image_preview"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <button
        type="button"
        className="w-full bg-red-400 text-white font-semibold font-roboto"
        onClick={onDelete}
      >
        Delete
      </button>
    </motion.div>
  );
}

export default memo(PreviewImage);
