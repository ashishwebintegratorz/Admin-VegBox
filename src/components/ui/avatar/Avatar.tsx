interface AvatarProps {
  src?: string; // URL of the avatar image
  alt?: string; // Alt text for the avatar
  size?: number | "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge"; // Avatar size
  status?: "online" | "offline" | "busy" | "none"; // Status indicator
  nameForInitials?: string;
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6 text-[10px]",
  small: "h-8 w-8 max-w-8 text-[12px]",
  medium: "h-10 w-10 max-w-10 text-[14px]",
  large: "h-12 w-12 max-w-12 text-[16px]",
  xlarge: "h-14 w-14 max-w-14 text-[18px]",
  xxlarge: "h-16 w-16 max-w-16 text-[20px]",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none",
  nameForInitials,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isNumericSize = typeof size === "number";
  const sizeStyle = isNumericSize ? { width: size, height: size, fontSize: size / 3 } : {};
  const containerClass = isNumericSize 
    ? "relative rounded-full" 
    : `relative rounded-full ${sizeClasses[size]}`;

  return (
    <div className={`${containerClass} flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800`} style={sizeStyle}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-slate-500">
          {nameForInitials ? getInitials(nameForInitials) : "?"}
        </span>
      )}

      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 bg-success-500 h-[25%] w-[25%]`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;
