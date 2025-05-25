import React from "react";
import md5 from "md5";
import Image from "next/image";

interface GravatarProps {
  email: string;
  size?: number;
  className?: string;
}

const Gravatar: React.FC<GravatarProps> = ({ email, size = 32, className }) => {
  const hash = md5(email.toLowerCase().trim());
  const url = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;

  return (
    <Image
      src={url}
      alt="User Avatar"
      className={className}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
};

export default Gravatar;
