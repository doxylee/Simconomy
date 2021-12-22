import { AppBar, Button, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";

interface Props {
    children: React.ReactNode;
}

const NavigationButton = ({ text }: { text: string }) => <Button className="text-white text-xl hover:bg-blue-200/25 mr-2">{text}</Button>;

export default function NavigationLayout({ children }: Props) {
    return (
        <div>
            <AppBar position="static" className="bg-neutral-900 ">
                <Toolbar variant="dense">
                    <IconButton size="large" edge="start" className="text-white">
                        <MenuIcon />
                    </IconButton>
                    <NavigationButton text={"Dashboard"} />
                    <NavigationButton text={"Factories"} />
                    <NavigationButton text={"Shops"} />
                    <div className="grow" />
                    <div className="flex flex-row items-center">
                        <div>2020.12.12</div>
                        <IconButton size="large" className="text-white">
                            <PlayArrowIcon />
                        </IconButton>
                        <div id="nav_cash_display" className="items-baseline space-x-1">
                            <span>$1,523K</span>
                            <span className="text-xs text-green-400">(+42.52K)</span>
                        </div>
                        <IconButton size="large" edge="end" className="text-white">
                            <SettingsIcon />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <main>{children}</main>
        </div>
    );
}
