import { Card, CardActionArea, CardContent, IconButton } from "@mui/material";
import { DateTime } from "luxon";
import CloseIcon from "@mui/icons-material/Close";
import { SaveType } from "@src/utils/saves";

interface Props {
    save: SaveType;
    loadGame: (save: SaveType) => void;

    className?: string;
}

export default function SaveCard({ save, loadGame, className }: Props) {
    return (
        <Card className={"flex items-center " + className}>
            <CardActionArea onClick={() => loadGame(save)}>
                <CardContent className="flex flex-row items-center space-x-2">
                    <div className="font-bold">{save.name}</div>
                    <div className="grow" />
                    <div>{save.savedAt.toLocaleString(DateTime.DATETIME_SHORT)}</div>
                </CardContent>
            </CardActionArea>
            <IconButton>
                <CloseIcon />
            </IconButton>
        </Card>
    );
}
