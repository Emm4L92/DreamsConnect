import { cn } from "@/lib/utils";

// Array of pixel art avatar URLs to choose from
const AVATAR_URLS = [
  "https://pixabay.com/get/gafcd4cda276c7156705b35e0953cdfbd28d792d8332e7b0833eb2347140248a3b262eb33baaf3242e6fb9fc75d1b38148103a16e037a19bc211d954ea46d66f0_1280.jpg",
  "https://pixabay.com/get/gb7430f5453015c8fcd38f1b5541f65f660244f63c7f4084d14b32ac51a3e5c2df6a4eb9858f18b9681f52cf673ead36fd6b9c8f1cfe1ad85dccc734ebe9177e7_1280.jpg",
  "https://pixabay.com/get/g8e16252d9fd1bc94a1b603a02ebf73bd58c8ed0fbd0a922f85db12e6977b71ce72f2e1aad29ce1c6a1cea76930b3afe1492ee9beace9ae62c411485eec314e1d_1280.jpg",
  "https://pixabay.com/get/g18980bff350c4a75fe4378e143a4019adace2c6587815b02820328831e80a60d941ffac5f7c29f03212589086581e70d26fd13dda88b93c2882656db17161db6_1280.jpg",
  "https://pixabay.com/get/g8f0fd43502b87224e9243719402c71682c9c9b0ad1f1dae8bf2979b6b59ca7e3e1d4e29e393e292daa65a6e8c270cd1084c5cd75ab19cb7adfbf47dea1610fc3_1280.jpg",
  "https://pixabay.com/get/g0487aea35edeb0e1f3ac5d9a2ec4bf383baec57e4b891b7aca97be24752712d4a8ec0f1450ee38c4aa89da4a3ec4bab333e0bed4efc74ce8e4ea23ef8c1cee7e_1280.jpg"
];

type PixelAvatarProps = {
  id: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  profileImage?: string | null;  // URL dell'immagine profilo personalizzata
  username?: string;             // Nome utente per l'attributo alt
};

export function PixelAvatar({ 
  id, 
  size = "sm", 
  className,
  profileImage,
  username
}: PixelAvatarProps) {
  // Determiniamo se utilizzare l'immagine profilo caricata o l'avatar pixel
  const useCustomImage = !!profileImage;
  
  // Se non c'è un'immagine personalizzata, utilizziamo un pixel avatar
  const safeId = Math.abs(id % AVATAR_URLS.length);
  const avatarUrl = useCustomImage ? profileImage : AVATAR_URLS[safeId];
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };
  
  const altText = username ? `${username}'s avatar` : "User avatar";
  
  return (
    <img 
      src={avatarUrl as string} 
      alt={altText} 
      className={cn(
        "border-2 border-black pixel-border object-cover",
        useCustomImage ? "rounded-full" : "",
        sizeClasses[size],
        className
      )}
      onError={(e) => {
        // Se l'immagine personalizzata non si carica, fallback all'avatar pixel
        if (useCustomImage) {
          const target = e.target as HTMLImageElement;
          target.src = AVATAR_URLS[safeId];
          target.classList.remove("rounded-full");
        }
      }}
    />
  );
}
