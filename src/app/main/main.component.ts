import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit
{
  readonly types: string[] = [
    "today",
    "week",
    "month",
    "year"
  ];

  readonly days: string[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  readonly months: string[] = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  loading: boolean = false;

  targetType: string = "week";
  today: Date;
  todayToString: string = "";
  weekNumber: number;
  thisWeek: Date[] = [];

  allNotes: any[][][] = [];

  constructor()
  {}

  ngOnInit(): void
  {
    this.today = new Date();
    this.setup(this.today);
  }

  setup(day: Date): void
  {
    this.todayToString = this.dateToString(day);
    this.weekNumber = this.getWeekNumber(day);
    this.thisWeek = this.setupWeek(day);

    this.allNotes = this.allNoteSetup();
    // import from storage
  }

  allNoteSetup(): any[][][]
  {
    var toReturn: any[][][] = [];

    for (let y = 0; y < 3; y++)
    {
      toReturn.push([]);

      for (let m = 0; m < 12; m++)
      {
        toReturn[y].push([]);
        var monthDays = this.daysInMonth(m + 1, this.today.getFullYear() + y - 1)

        for (let d = 0; d < monthDays; d++)
        {
          toReturn[y][m].push([]);
        }
      }
    }

    return toReturn;
  }

  daysInMonth(month, year)
  {
    return new Date(year, month, 0).getDate();
  }

  addNoteToDay(day: Date): void
  {
    console.log(day);
    // make targetNotes equal to target day
    this.allNotes[day.getFullYear() - this.today.getFullYear()][day.getMonth()][day.getDate()].push("");
  }

  removeNoteFromDay(day: Date, index: number): void
  {
    if (confirm("Are you sure? You cannot revert this action!"))
      this.allNotes[day.getFullYear()][day.getMonth()][day.getDate()].splice(index, 1);
  }

  saveFunction(day: Date): void
  {
    this.loading = true;

    const targetDay = this.dateToString(day);
    const retrieved = localStorage.getItem(targetDay);

    console.log(`Saving for ${day}`);
    // save array of notes to memory

    // first check if there was an entry before and no items to save currently
    if (retrieved !== null && retrieved !== undefined && this.allNotes[day.getFullYear()][day.getMonth()][day.getDate()].length === 0)
    {
      localStorage.removeItem(targetDay);
      return;
    }

    localStorage.setItem(targetDay, JSON.stringify(this.allNotes[day.getFullYear()][day.getMonth()][day.getDate()]));

    this.loading = false;
  }

  capitalizeFirstLetter(word: string): string
  {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  padLeadingZeros(number: number): string
  {
    var value = number.toString();
    while (value.length < 2) value = "0" + value;
    return value;
  }

  getWeekNumber(day: Date): number
  {
    const targetDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() - 3);
    const yearStart = Date.UTC(day.getFullYear(), 0, 1);
    const diff = (targetDay - yearStart);

    return Math.ceil(((diff / 86400000) + 1) / 7);
  }

  setupWeek(day: Date): Date[]
  {
    var toReturn: Date[] = [];

    var weekStart = new Date(day);
    weekStart.setDate((weekStart.getDate() - weekStart.getDay() +1));

    for (var i = 0; i < 7; i++)
    {
      toReturn.push(new Date(weekStart));
      weekStart.setDate(weekStart.getDate() +1);
    }

    return toReturn;
  }

  dateToString(day: Date): string
  {
    const correctMonth = day.getMonth() + 1;
    return `${this.padLeadingZeros(day.getDate())}/${this.padLeadingZeros(correctMonth)}/${day.getFullYear()}`
  }

  isDayToday(day: Date): boolean
  {
    return (this.dateToString(day) === this.todayToString);
  }

  trackByFn(index: any, item: any): any
  {
    return index;
  }
}
