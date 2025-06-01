/**
 * Tests for ChatMessage Component
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatMessage from "../ChatMessage";

describe("ChatMessage", () => {
  it("renders user message with correct class", () => {
    // Arrange
    const message = "Hello, this is a user message";
    const type = "user";

    // Act
    render(<ChatMessage message={message} type={type} />);
    
    // Assert
    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass("user-message");
    expect(messageElement).not.toHaveClass("bot-message");
  });

  it("renders bot message with correct class", () => {
    // Arrange
    const message = "Hello, this is a bot response";
    const type = "bot";

    // Act
    render(<ChatMessage message={message} type={type} />);
    
    // Assert
    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveClass("bot-message");
    expect(messageElement).not.toHaveClass("user-message");
  });

  it("renders message with multiline content", () => {
    // Arrange
    const message = "This is a\nmulti-line\nmessage";
    const type = "user";

    // Act
    render(<ChatMessage message={message} type={type} />);
    
    // Assert
    const messageElement = screen.getByText(message);
    expect(messageElement).toBeInTheDocument();
  });
});
