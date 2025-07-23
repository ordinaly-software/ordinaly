"use client";

import React from "react";
import styled from "styled-components";
const StyledButtonWrapper = styled.div`
  .button {
    --white: #ffffff;
    --primary-light: #29BF12;
    --primary-dark: #2bc765;
    --radius: 18px;

    border-radius: var(--radius);
    outline: none;
    cursor: pointer;
    font-size: 23px;
    font-family: Arial, sans-serif;
    background: transparent;
    letter-spacing: -1px;
    border: 0;
    position: relative;
    width: 220px;
    height: 80px;
    transform: rotate(353deg) skewX(4deg);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: -7px 6px 0 0 rgba(50, 232, 117, 0.4),
      -14px 12px 0 0 rgba(50, 232, 117, 0.3),
      -21px 18px 4px 0 rgba(50, 232, 117, 0.25),
      -28px 24px 8px 0 rgba(50, 232, 117, 0.15),
      -35px 30px 12px 0 rgba(50, 232, 117, 0.12),
      -42px 36px 16px 0 rgba(50, 232, 117, 0.08),
      -56px 42px 20px 0 rgba(50, 232, 117, 0.05);
  }

  .bg {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--primary-light);
    filter: blur(5px);
    transition: background 0.3s ease, filter 0.3s ease;
  }

  .wrap {
    border-radius: inherit;
    overflow: hidden;
    height: 100%;
    padding: 3px;
    background: linear-gradient(
      to bottom,
      var(--primary-light),
      var(--primary-dark)
    );
    position: relative;
    transition: transform 0.3s ease;
  }

  .content {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    position: relative;
    height: 100%;
    font-weight: 600;
    color: var(--white);
    background: var(--primary-light);
    border-radius: calc(var(--radius) * 0.85);
    box-shadow:
      inset -2px 12px 11px -5px rgba(0, 0, 0, 0.1),
      inset 1px -3px 11px 0px rgba(0, 0, 0, 0.35);
    transition: background 0.3s ease, box-shadow 0.3s ease;
    padding: 0 20px;
  }

  .button:hover {
    transform: translateY(-4px) rotate(353deg) skewX(4deg);
    box-shadow: 0px 8px 15px rgba(50, 232, 117, 0.3);
  }

  .button:hover .bg {
    filter: blur(8px);
    background: var(--primary-dark);
  }

  .button:hover .wrap {
    transform: translate(4px, -4px);
  }

  .button:hover .content {
    background: var(--primary-dark);
    box-shadow:
      inset -2px 12px 11px -5px rgba(0, 0, 0, 0.2),
      inset 1px -3px 11px 0px rgba(0, 0, 0, 0.4);
  }
`;

interface StyledButtonProps {
  text: string | React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

const StyledButton: React.FC<StyledButtonProps> = ({ text, href, target, rel, onClick }) => {
  const buttonContent = (
    <button className="button" onClick={onClick}>
      <div className="bg" />
      <div className="wrap">
        <div className="content">
          <span>{text}</span>
        </div>
      </div>
    </button>
  );

  // If href is provided, wrap the button in an anchor tag
  if (href) {
    return (
      <StyledButtonWrapper>
        <a href={href} target={target} rel={rel}>
          {buttonContent}
        </a>
      </StyledButtonWrapper>
    );
  }

  // Otherwise, just return the button
  return <StyledButtonWrapper>{buttonContent}</StyledButtonWrapper>;
};
export default StyledButton;