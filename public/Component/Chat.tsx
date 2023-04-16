import React, {useState} from 'react';

interface Message {
    message: string;
    from: 'user' | 'server';
}

interface Error {
    message: string;
    from: 'user' | 'server';
}

const ChatBox: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<Error[]>([]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const message = event.currentTarget.message.value;
        //make sure message start with "extract vocal from" string
        // if (message && (!message.startsWith("extract vocal from") || !message.endsWith("on youtube"))) {
        //     setError([{
        //         message: "Please follow the following convention 'extract vocal from {your query} on youtube'",
        //         from: 'server'
        //     }]);
        //     return;
        // }
        messages.push({message, from: 'user'});
        setMessages(messages);
        event.currentTarget.reset();
        //Call API endpoint /chat
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: message}),
        }).then((response) => {
            if (response.ok) {
                const res = response.json();
                setMessages([...messages,{
                    message: 'hahahah',
                    from: 'server'
                }]);
            }
            throw new Error(response.statusText);
        }).catch((error) => {
            const message = error.message;
            setError([{
                message,
                from: 'server'
            }]);
        });
    };

    return (
        <>
            <div className="header">
                <div className="header-title">Audio Slicer</div>
            </div>
            <div className="chat-box">
                <div className="messages-container">
                    {messages.map((msg: Message, idx: number) => (
                        <div key={idx} className={`message ${msg.from}`}>
                            {msg.message}
                        </div>
                    ))}
                </div>
                <div className="error-container">
                    {error.map((err: Error, idx: number) => (
                        <div key={idx} className={`error ${err.from}`}>
                            {err.message}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="message" placeholder="Type your message here"/>
                    <button type="submit">Send</button>
                </form>
            </div>
        </>

    );
};

export default ChatBox;
