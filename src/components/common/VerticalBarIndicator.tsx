import { Tooltip, TooltipProps } from "@mui/material";

type Props = {
    values: {
        /** Proportion in 0..1 range */
        value: number;
        className: string;
        tooltip?: string;
    }[];
    styleClassOverride?: string;
    tooltipPlacement?: TooltipProps["placement"];
};

export function VerticalBarIndicator({ values, styleClassOverride = "w-4 border border-gray-300", tooltipPlacement }: Props) {
    const getPercent = (value: number) => `${value * 100}%`;

    return (
        <div className={"flex flex-col items-stretch " + styleClassOverride}>
            <div className="grow" />
            {values.map(({ value, className, tooltip }, idx) =>
                tooltip ? (
                    <Tooltip title={tooltip} placement={tooltipPlacement} arrow key={idx}>
                        <div className={className} style={{ height: getPercent(value) }} />
                    </Tooltip>
                ) : (
                    <div className={className} style={{ height: getPercent(value) }} key={idx} />
                )
            )}
        </div>
    );
}
