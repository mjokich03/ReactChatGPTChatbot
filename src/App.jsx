import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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";//this api key goes to openai api, we want to switch this out for our own api key

const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."//this is a system message that tells the chatbot HOW to respond to each prompt.
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am notChatGPT! Ask me anything!",//initial chatbot message to start the conversation
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const handleSend = async (message) => {//event handler for new outgoing messages to the chatbot from the user
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };
    const newMessages = [...messages, newMessage];//load the new messages into an array
    setMessages(newMessages);//change state of the messages

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    //everything before this doesn't need to change!!!the only things we want to change is anything connected to the openai api and redirect it to our own api.
    await processMessageToChatGPT(newMessages);
  };


  
  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {//loops over every single chat message and creates a new message object
      let role = "";
      if (messageObject.sender === "ChatGPT") {//assigns roles to each message based on who sent it(either the user or chatbot)
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}//after assigning roles to the senders of each message, the api messages are stored in an array
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // Loads the messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", //api call to openai api endpoint, we want to change this to our api endpoint
    {
      method: "POST",//leave this as post
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)//this is the body of the api call, we want to change this to our own api body format
    }).then((data) => {
      return data.json();//response data is converted to json format
    }).then((data) => {
      console.log(data);//log to console for debugging
      setMessages([...chatMessages, {//update the state of messages var by adding a new message object with content of the first choice from the api response
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList //component displays the messages from the 'messages' array
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} /> {/* component allows users to enter new messages and triggers the 'handleSend' function when a message is sent*/}      
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
