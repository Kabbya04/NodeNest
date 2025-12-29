# Node Nest

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel_AI_SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Cloud-FF6B00?style=for-the-badge&logo=ai&logoColor=white)

A general-purpose chatbot with specialized sub-conversation branching features. Built with React, Vite, Tailwind CSS, Vercel AI SDK, and Supabase.

## Features

- **Main Conversation**: Central conversation thread
- **Sub-Conversations**: Select text from AI responses to create branching sub-conversations
- **Context Preservation**: Sub-conversations inherit context from parent conversations
- **Tab Navigation**: Browser-like tabs to navigate between conversations
- **Graph Visualization**: Tree-like graph view showing conversation branches
- **Model Selection**: Choose from multiple LLM models (via Groq Cloud)
- **Authentication**: User authentication via Supabase
- **Persistent Storage**: Conversation history saved to Supabase

## Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **Zustand** for state management
- **React Flow** for graph visualization
- **Lucide React** for icons
- **Vercel AI SDK** for chat interface



## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Groq Cloud API key

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node-nest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   VITE_SITE_URL=http://localhost:3000 
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Copy the contents of supabase-schema.sql
   # Run it in the Supabase SQL Editor
   ```

5. **Configure OAuth (Google Sign-In)**
   
   The authentication system uses Supabase Auth with PKCE flow.
   
   - **Redirect URL Configuration**: 
     Ensure your Supabase project allows the callback URL: `${VITE_SITE_URL}/auth/callback`.
   - **Documentation**:
     For a detailed explanation of the authentication flow and configuration, please refer to [auth-flow.md](./auth-flow.md).

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`


## Project Structure

```
node-nest/
├── src/
│   ├── components/       # React components
│   │   ├── ChatInput.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationGraph.tsx
│   │   ├── ConversationTabs.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ModelSelector.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/             # Utility libraries
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── store/           # Zustand stores
│   │   ├── conversationStore.ts
│   │   └── modelStore.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles

├── supabase-schema.sql  # Database schema
└── package.json
```

## Usage

### Creating a Sub-Conversation

1. Wait for the AI to respond to your message
2. Select the text in the AI's response that you want to ask about
3. Click the "Ask about this" button that appears
4. A new sub-conversation tab will open with the selected context
5. Ask your follow-up question in the new conversation

### Switching Between Conversations

- Use the tabs below the header to switch between conversations
- Click on the Graph view icon to see the conversation tree
- Click on any node in the graph to navigate to that conversation

### Changing the Model

- Click the Settings icon in the sidebar
- Select from the available Groq models:
   - openai/gpt-oss-120b
   - openai/gpt-oss-20b
   - llama-3.3-70b-versatile
   - llama-3.1-8b-instant

## Available Models (Groq Cloud)

The application supports the following models from Groq Cloud:
- **openai/gpt-oss-120b**: Large-scale GPT model optimized for complex reasoning and comprehensive responses
- **openai/gpt-oss-20b**: Medium-sized GPT model balancing performance and efficiency
- **llama-3.3-70b-versatile**: Meta's versatile Llama model for diverse tasks
- **llama-3.1-8b-instant**: Fast, efficient Llama model for quick responses

## Development

### Scripts

- `npm run dev` - Start Vite development server

- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Add authentication UI (login/signup)
- [ ] Implement conversation persistence to Supabase
- [ ] Add conversation export/import
- [ ] Support for file attachments
- [ ] Voice input/output
- [ ] Collaborative conversations
- [ ] Custom system prompts
- [ ] Conversation search
- [ ] Dark mode toggle


## Contributing

Contributions are welcome! Please open an issue or submit a pull request.