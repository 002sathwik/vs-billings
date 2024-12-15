// BillCard.tsx
interface BillCardProps {
    customerName: string;
    price: number;
    date: string;
}

const BillCard = ({ customerName, price, date }: BillCardProps) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full max-w-xs">

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-grotesk font-bold">
                        VP
                    </div>
                </div>

            </div>
            <div className="mb-4 border border-black rounded-md p-2 font-sora">
                <h3 className="text-lg font-bold text-gray-700">{customerName}</h3>
            </div>

            <div className="flex justify-between items-center font-sora ">

                <p className="text-sm  text-black bg-neutral-300 p-1 rounded-xl ">{new Date(date).toLocaleDateString()}</p>

                <p className="text-xl font-semibold text-gray-800">₹{price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default BillCard;
