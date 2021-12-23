import { Button } from "@mui/material";
import CommonHeader from "@src/components/common/CommonHeader";
import SaveCard from "@src/components/specific/main/SaveCard";
import { SaveType, useGetSaves } from "@src/utils/saves";
import { useSetCore } from "@src/utils/useCore";
import { ReactAdapter } from "@src/adapter/ReactAdapter";
import { useRouter } from "next/router";

const START_PAGE_URL_OBJ = { pathname: "/factories" };

MainPage.layout = "none";
export default function MainPage() {
    const { saves } = useGetSaves();
    const setCore = useSetCore();
    const router = useRouter();

    const newGame = async () => {
        const core = new ReactAdapter();
        await core.initialize();
        setCore(core);
        await router.push(START_PAGE_URL_OBJ);
    };

    const loadGame = async (save: SaveType) => {
        const core = new ReactAdapter({ gameId: save.id });
        await core.load();
        setCore(core);
        await router.push(START_PAGE_URL_OBJ);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <CommonHeader />

            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-8xl font-bold mb-24">Simconomy</h1>
                <Button
                    variant={"contained"}
                    className="p-4 w-160 mb-12 bg-green-400 hover:bg-green-500 text-white text-base font-bold"
                    onClick={newGame}
                >
                    New Game
                </Button>
                {saves?.map((save) => (
                    <SaveCard className="w-160" save={save} loadGame={loadGame} />
                ))}
            </main>
        </div>
    );
}
