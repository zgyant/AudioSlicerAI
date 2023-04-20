import React, {useState} from 'react';

interface Message {
    message: string;
    from: 'user' | 'server';
    url: string | null;
    type: string | null;
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
        setMessages([...messages, {message, from: 'user', url: '#', type: 'search'}]);
        setMessages([...messages, {message: 'Searching.....', from: 'server', url: '#', type: 'search'}]);
        event.currentTarget.reset();
        //Call API endpoint /chat
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: message}),
        }).then(async (response) => {
            if (response.ok) {
                const res: any = await response.json();
                const serverResponses: Message[] = [];
                res.data.map((item: any) => {
                    serverResponses.push({
                        message: `${item.title} can be found on ${item.url}`,
                        from: 'server',
                        url: item.url,
                        type: 'result'
                    })
                });
                setMessages(serverResponses);
            } else {
                throw new Error(response.statusText);
            }
        }).catch((error) => {
            const message = error.message;
            setError([{
                message,
                from: 'server'
            }]);
        });
    };

    async function runSeparator(response: Message) {
        if (response.url === '#' || response.from === 'user') return;

        if (response.type === 'download' && response.url) {
            window.open(response.url);
            // Delete file after 5seconds
            setTimeout(() => {
                fetch('/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({file: response.url}),
                });
            }, 5000);
            return;
        }

        setMessages([{message: 'Fetching audio.....', from: 'server', url: '#', type: 'extract'}])
        const result = await fetch('/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url: response.url}),
        });
        if (result.ok) {
            const res: any = await result.json();
            setMessages([res])
        } else {
            const message = result.statusText;
            setError([{
                message,
                from: 'server'
            }]);
        }
    }

    return (
        <>
            <div className="header">
                <div className="header-title">Spleetor Youtube</div>
            </div>
            <div className="chat-box">
                <div className="messages-container">
                    {messages.map((msg: Message, idx: number) => (
                        <div key={idx} className={`message ${msg.from}`} onClick={() => runSeparator(msg)}>
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
                    <input type="text" name="message" placeholder="Search on YouTube"/>
                    <button type="submit">Send</button>
                </form>
            </div>
        </>

    );
};

export default ChatBox;
