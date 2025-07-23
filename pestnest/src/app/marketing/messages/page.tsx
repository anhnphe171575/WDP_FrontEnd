import Messages from '@/components/chatbox/Messages';

export default function MarketingMessagesPage() {
    return (
        <div className="w-full px-8 pt-16 pb-8 bg-white rounded-2xl shadow-lg min-h-[600px] flex flex-col">
            <h1 className="text-3xl font-bold text-black-700 mb-6 text-center tracking-wide">
                Hộp thư chăm sóc khách hàng
            </h1>
            <div className="flex-1 overflow-y-auto">
                <Messages />
            </div>
        </div>
    );
}