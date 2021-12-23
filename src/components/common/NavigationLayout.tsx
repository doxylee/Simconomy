import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSaveGame } from "@src/utils/saves";
import { useSnackbar } from "notistack";

interface Props {
    children: React.ReactNode;
}

const NavigationButton = ({ text }: { text: string }) => <Button className="text-white text-xl hover:bg-blue-200/25 mr-2">{text}</Button>;

export default function NavigationLayout({ children }: Props) {
    const saveGame = useSaveGame();
    const { enqueueSnackbar } = useSnackbar();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleSave = () => {
        saveGame().catch((reason) => enqueueSnackbar(reason.message, { variant: "error" }));
        handleClose();
    };

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
                        <IconButton size="large" edge="end" className="text-white" onClick={handleMenu}>
                            <SettingsIcon />
                        </IconButton>
                    </div>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={!!anchorEl}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleSave}>Save</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <main>{children}</main>
        </div>
    );
}
