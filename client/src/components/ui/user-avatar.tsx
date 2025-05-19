import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ name, src, size = "md" }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {src && <img src={src} alt={name} />}
      <AvatarFallback className="text-sm bg-blue-100 text-blue-500">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
