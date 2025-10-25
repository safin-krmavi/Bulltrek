import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// Update the interface DurationTooltipProps to make onHourlyStartTimeChange a function type
interface DurationTooltipProps {
  children: React.ReactNode
  type: "Daily" | "Weekly" | "Monthly" | "Hourly"
  onTimeChange: (time: string) => void
  onAmPmChange?: (value: string) => void
  onDaysChange?: (days: string[]) => void
  onDateChange?: (date: string) => void
  onHourlyStartTimeChange: (time: string) => void
  onSelectionComplete?: (data: {
    type: string;
    time?: string;
    amPm?: string;
    date?: string;
    hours?: string;
  }) => void
  defaultTime?: string
  defaultAmPm?: string
  selectedDays?: string[]
  selectedDate?: string
  isSelected?: boolean
}

export function DurationTooltip({
  children,
  type,
  onTimeChange,
  onAmPmChange,
  onDateChange,
  onHourlyStartTimeChange,
  onSelectionComplete,
  defaultTime,
  defaultAmPm,
  selectedDate,
  isSelected = false,
}: DurationTooltipProps) {
  const dates = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  const [open, setOpen] = React.useState(false);
  const [manualClose, setManualClose] = React.useState(false);

  React.useEffect(() => {
    if (isSelected && !manualClose) {
      setOpen(true);
    } else if (!isSelected) {
      setManualClose(false);
      setOpen(false);
    }
  }, [isSelected, manualClose]);

  const [selectedTime, setSelectedTime] = React.useState(defaultTime || "12:00");
  const [selectedAmPm, setSelectedAmPm] = React.useState(defaultAmPm || "AM");
  const [localDate] = React.useState(selectedDate || "1");
  const [localHours, setLocalHours] = React.useState("1");

  // Update local state when props change
  React.useEffect(() => {
    if (defaultTime) setSelectedTime(defaultTime);
    if (defaultAmPm) setSelectedAmPm(defaultAmPm);
  }, [defaultTime, defaultAmPm]);

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    onTimeChange(time);
    // Trigger selection complete to save immediately
    if (onSelectionComplete) {
      onSelectionComplete({
        type,
        time,
        amPm: selectedAmPm,
        date: localDate,
        hours: type === "Hourly" ? localHours : undefined
      });
    }
  };

  const handleAmPmChange = (value: string) => {
    setSelectedAmPm(value);
    if (onAmPmChange) onAmPmChange(value);
    // Trigger selection complete to save immediately
    if (onSelectionComplete) {
      onSelectionComplete({
        type,
        time: selectedTime,
        amPm: value,
        date: localDate,
        hours: type === "Hourly" ? localHours : undefined
      });
    }
  };

  const handleHoursChange = (value: string) => {
    setLocalHours(value);
    onTimeChange(value);
    // Trigger selection complete to save immediately
    if (onSelectionComplete) {
      onSelectionComplete({
        type,
        time: selectedTime,
        amPm: selectedAmPm,
        date: localDate,
        hours: value
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClose();
    }
  };

  const handleClose = () => {
    if (onSelectionComplete) {
      const data = {
        type,
        time: selectedTime,
        amPm: selectedAmPm,
        date: localDate,
        hours: type === "Hourly" ? localHours : undefined
      };
      onSelectionComplete(data);
    }
    setManualClose(true);
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip open={open}>
        <TooltipTrigger asChild onClick={() => {
          if (manualClose) {
            setManualClose(false);
            setOpen(true);
          }
        }}>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white dark:bg-[#232326] p-4 border rounded-md shadow-lg w-[280px]"
          side="right"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">{type === "Monthly" ? "Select Date of Month" : type === "Hourly" ? "Enter Hourly Time (1-23 Hrs)" : "Repeats On"}</Label>
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {type === "Monthly" && (
              <>
                {/* <Label className="text-sm font-medium">Select Date of Month</Label> */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Date</Label>
                    <Select onValueChange={onDateChange} defaultValue={selectedDate || "1"}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates.map(date => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    {/* <Label className="text-sm text-gray-500">Repeats On</Label> */}
                    <div className="flex gap-2 items-center">
                      <Input
                        type="time"
                        value={selectedTime || defaultTime || "12:00"}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Select value={selectedAmPm || defaultAmPm || "AM"} onValueChange={handleAmPmChange}>
                        <SelectTrigger className="w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {type === "Hourly" && (
              <>
                {/* <Label className="text-sm font-medium">Enter Hourly Time (1-23 Hrs)</Label> */}
                <div className="space-y-4">
                    <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Hours</Label>
                    <Input
                      type="number"
                      min="1"
                      max="23"
                      placeholder="Enter hours"
                      onChange={(e) => handleHoursChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Start Time</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="time"
                        defaultValue={defaultTime || "00:00"}
                        onChange={(e) => onHourlyStartTimeChange(e.target.value)}  // Remove optional chaining
                        className="flex-1"
                      />
                      <Select defaultValue={defaultAmPm || "AM"} onValueChange={onAmPmChange}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                </div>
              </>
            )}

            {type !== "Hourly" && type !== "Monthly" && (
              <>
                {/* <Label>Repeats On</Label> */}
                <div className="flex gap-2 items-center">
                  <Input
                    type="time"
                    defaultValue={defaultTime || "12:00"}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="flex-1"
                  />
                  <Select defaultValue={defaultAmPm || "AM"} onValueChange={onAmPmChange}>
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}