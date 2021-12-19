import { Button } from "@mui/material";
import CommonHeader from "@src/components/common/CommonHeader";
import SaveCard from "@src/components/specific/main/SaveCard";
import { DateTime } from "luxon";

MainPage.layout = "none";
export default function MainPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <CommonHeader />

            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-8xl font-bold mb-24">Simconomy</h1>
                <Button variant={"contained"} className="p-4 w-160 mb-12 bg-green-400 hover:bg-green-500 text-white text-base font-bold">
                    New Game
                </Button>
                <SaveCard className="w-160" saveName={"Save 1"} saveDate={DateTime.now()} />
            </main>
        </div>
    );
}
