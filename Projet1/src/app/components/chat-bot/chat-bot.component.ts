import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../../services/chat.service';
import { HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    DatePipe,
    HttpClientModule
  ]
})
export class ChatBotComponent implements OnInit, AfterViewChecked {
  messages: ChatMessage[] = [];
  messageInput = new FormControl('');
  isMinimized = false;
  isTyping = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Welcome message
    setTimeout(() => {
      this.addBotMessage('Hello! 👋 I am your virtual assistant.');
      setTimeout(() => {
        this.addBotMessage('I can help you with:\n- Finding the best prices\n- Comparing products\n- Searching for flights\n- Finding hotels\n\nWhat would you like to do?');
      }, 500);
    }, 1000);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }

  sendMessage(): void {
    const message = this.messageInput.value?.trim();
    if (message) {
      // Add user message
      this.addUserMessage(message);
      
      // Clear input
      this.messageInput.setValue('');

      // Indicate that the bot is typing
      this.isTyping = true;

      // Call Flask API
      this.chatService.sendMessage(message).subscribe({
        next: (response) => {
          this.isTyping = false;
          if (response.response) {
            this.addBotMessage(this.processResponse(response.response));
          }
        },
        error: (error) => {
          this.isTyping = false;
          console.error('Error calling API:', error);
          this.addBotMessage('Sorry, I am experiencing technical difficulties. Could you try again later?');
        }
      });
    }
  }

  private processResponse(response: string): string {
    // Adapt the response to be more natural and relevant
    let processedResponse = response.trim();
    
    // Add emojis based on context
    if (processedResponse.toLowerCase().includes('hello')) {
      processedResponse = '👋 ' + processedResponse;
    }
    if (processedResponse.toLowerCase().includes('price')) {
      processedResponse = '💰 ' + processedResponse;
    }
    if (processedResponse.toLowerCase().includes('flight')) {
      processedResponse = '✈️ ' + processedResponse;
    }
    if (processedResponse.toLowerCase().includes('hotel')) {
      processedResponse = '🏨 ' + processedResponse;
    }

    return processedResponse;
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      content,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      content,
      isUser: false,
      timestamp: new Date()
    });
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  transformLineBreaks(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
} 