import { Button } from "@mui/material";
import CommonHeader from "@src/components/common/CommonHeader";
import FactoryListItem from "@src/components/specific/factories/FactoryListItem";

export default function MainPage() {
    return (
        <main className="flex flex-col items-stretch space-y-4  w-full p-16 min-h-screen">
            <CommonHeader />

            <div id="factories_filter" className="p-6 border border-gray-400 text-center">
                filter
            </div>

            <div id="factories_list" className="flex flex-col items-stretch space-y-2">
                <Button variant="contained" className="text-white bg-green-400 hover:bg-green-500 text-base">
                    + Create
                </Button>
            </div>

            <FactoryListItem />
        </main>
    );
}
