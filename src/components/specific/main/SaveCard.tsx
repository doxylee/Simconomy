import { Card, CardActionArea, CardContent, IconButton } from "@mui/material";
import { DateTime } from "luxon";
import CloseIcon from "@mui/icons-material/close";

interface Props {
    saveName: string;
    saveDate: DateTime;
    className?: string;
}

export default function SaveCard({ className, saveName, saveDate }: Props) {
    return (
        <Card className={className}>
            <CardActionArea>
                <CardContent className="flex flex-row items-center space-x-2">
                    <div className="font-bold">{saveName}</div>
                    <div className="grow" />
                    <div>{saveDate.toLocaleString(DateTime.DATETIME_SHORT)}</div>
                    <IconButton>
                        <CloseIcon />
                    </IconButton>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
