import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  rightElement?: React.ReactNode;
}

const Header = ({ title, subtitle, rightElement }: HeaderProps) => {
  return (
    <div className="mb-7 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white-50 font-grotesk">{title}</h1>
        <p className="text-sm text-gray-500 mt-1 font-sora">{subtitle}</p>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>

  );
};

export default Header;
