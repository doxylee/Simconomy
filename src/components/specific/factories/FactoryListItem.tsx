import { Card, CardActionArea, CardContent } from "@mui/material";

interface Props {
    className?: string;
}

export default function FactoryListItem({ className }: Props) {
    return (
        <Card className={className}>
            <CardActionArea>
                <CardContent className="flex flex-row items-stretch space-x-2"></CardContent>
            </CardActionArea>
        </Card>
    );
}
