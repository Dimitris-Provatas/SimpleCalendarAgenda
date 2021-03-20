import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';

type directions = "left" | "both" | "right";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit
{
  readonly types: string[] = [
    "μέρα",
    "εβδομάδα",
    "μήνας",
    "χρόνος"
  ];

  readonly days: string[] = [
    "κυριακή",
    "δευτέρα",
    "τρίτη",
    "τετάρτη",
    "πέμπτη",
    "παρασκευή",
    "σάββατο",
  ];

  readonly months: string[] = [
    "ιανουάριος",
    "φεβρουάριος",
    "μάρτιος",
    "απρίλιος",
    "μάιος",
    "ιούνιος",
    "ιούλιος",
    "αύγουστος",
    "σεπτέμβριος",
    "οκτώβριος",
    "νοέμβριος",
    "δεκέμβριος",
  ];

  loading: boolean = false;

  allowedDirections: directions = "both";
  targetType: string = "χρόνος";

  today: Date;
  targetDay: Date;
  todayToString: string = "";

  weekNumber: number;
  targetWeek: Date[] = [];
  targetMonth: Date[] = [];
  targetYear: any[] = [];

  allNotes: any[][][] = [];

  constructor()
  {}

  ngOnInit(): void
  {
    this.today = new Date();
    this.targetDay = new Date();
    this.allNotes = this.allNoteSetup();
    this.setup(this.today);
  }

  setup(day: Date): void
  {
    this.todayToString = this.dateToString(day);
    this.targetWeek = this.setupWeek(day);
    this.targetMonth = this.setupMonth(day.getMonth());
    setTimeout(() => { this.targetYear = this.setupYear(day.getFullYear()); }, 500);
  }

  allNoteSetup(): any[][][]
  {
    var toReturn: any[][][] = [];

    // populate the array with empty cells
    for (let y = 0; y < 3; y++)
    {
      toReturn.push([]);

      for (let m = 0; m < 12; m++)
      {
        toReturn[y].push([]);
        var monthDays = this.daysInMonth(m + 1, this.today.getFullYear() + y - 1)

        for (let d = 0; d <= monthDays; d++)
        {
          toReturn[y][m].push([]);
        }
      }
    }

    // get existing localStorage entries' keys
    const keys = Object.keys(localStorage);

    // get the values of each key and add them to the correct cells
    keys.forEach(async key =>
    {
      const retrieved = await localStorage.getItem(key)
      const keySplit = key.split("/");
      toReturn[parseInt(keySplit[2]) - this.today.getFullYear() + 1][parseInt(keySplit[1]) - 1][parseInt(keySplit[0])] = JSON.parse(retrieved);
    });

    return toReturn;
  }

  async saveFunction(day: Date): Promise<void>
  {
    this.loading = true;

    const targetDay = this.dateToString(day);

    await localStorage.setItem(targetDay, JSON.stringify(this.allNotes[day.getFullYear() - this.today.getFullYear() + 1][day.getMonth()][day.getDate()]));
    this.loading = false;
  }

  getWeekNumber(day: Date): number
  {
    const targetDay = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() - 3);
    const yearStart = Date.UTC(day.getFullYear(), 0, 1);
    const diff = (targetDay - yearStart);

    return Math.ceil(((diff / 86400000) + 1) / 7);
  }

  daysInMonth(month, year)
  {
    return new Date(year, month, 0).getDate();
  }

  setupMonth(monthNumber: number): Date[]
  {
    var toReturn: Date[] = [];

    for (var i: number = 0; i < this.daysInMonth(monthNumber + 1, this.targetDay.getFullYear()) + 1; i++)
    {
      toReturn.push(this.createMonthDay(i, monthNumber));
    }
    toReturn.shift();

    return toReturn;
  }

  createMonthDay(dayNumber: number, monthNumber: number): Date
  {
    return new Date(this.targetDay.getFullYear(), monthNumber, dayNumber)
  }

  setupYear(year: number)
  {
    var monthsWithData = [];
    this.months.forEach((month, idx) =>
    {
      var daysWithNotes: number = 0;
      var totalMonthNotes: number = 0;
      for (var i: number = 0; i <= this.daysInMonth(idx, year); i++)
      {
        if (this.allNotes[year - this.today.getFullYear() + 1][idx][i] &&
            this.allNotes[year - this.today.getFullYear() + 1][idx][i].length > 0
        )
        {
          daysWithNotes += 1;
          totalMonthNotes += this.allNotes[year - this.today.getFullYear() + 1][idx][i].length;
        }
      }

      monthsWithData.push({
        month: month,
        daysWithNotes: daysWithNotes,
        numberOfNotes: totalMonthNotes
      });
    });

    return monthsWithData;
  }

  goToMonth(month: string)
  {
    this.targetDay.setMonth(this.months.indexOf(month));
    this.setupMonth(this.months.indexOf(month));
    this.targetType = "μήνας";
    this.setup(this.targetDay);
  }

  addNoteToDay(day: Date): void
  {
    this.allNotes[day.getFullYear() - this.today.getFullYear() + 1][day.getMonth()][day.getDate()].push("");
    this.saveFunction(day);
  }

  removeNoteFromDay(day: Date, index: number): void
  {
    if (confirm("Are you sure? You cannot revert this action!"))
    {
      this.allNotes[day.getFullYear() - this.today.getFullYear() + 1][day.getMonth()][day.getDate()].splice(index, 1);
      this.saveFunction(day);
    }
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

    this.weekNumber = this.getWeekNumber(day);

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

  arrow(context: string, dir: string): void
  {
    // ignore if chosen direction is not allowed
    if (dir === "left" && this.allowedDirections === "right") return;
    if (dir === "right" && this.allowedDirections === "left") return;

    this.allowedDirections = "both";

    switch (context)
    {
      case "μέρα":
        // check if it is the first day of the previous year or the last day of the next year
        // then change the allowedDirections as necassery
        switch (dir)
        {
          case "left":
            this.targetDay.setDate(this.targetDay.getDate() - 1);
            if (this.targetDay.getFullYear() < this.today.getFullYear() - 1)
            {
              this.targetDay.setDate(this.targetDay.getDate() + 1);
              this.allowedDirections = 'right';
            }
            break;
          case "right":
            this.targetDay.setDate(this.targetDay.getDate() + 1);
            if (this.targetDay.getFullYear() > this.today.getFullYear() + 1)
            {
              this.targetDay.setDate(this.targetDay.getDate() - 1);
              this.allowedDirections = 'left';
            }
            break;
        }
        break;
      case "εβδομάδα":
        // check if it is the first wekk of the previous year or the last week of the next year
        // then change the allowedDirections as necassery
        switch (dir)
        {
          case "left":
            this.targetDay.setDate(this.targetDay.getDate() - 7);
            if (this.targetDay.getFullYear() < this.today.getFullYear() - 1)
            {
              this.targetDay.setDate(this.targetDay.getDate() + 7);
              this.allowedDirections = 'right';
            }
            break;
          case "right":
            this.targetDay.setDate(this.targetDay.getDate() + 7);
            if (this.targetDay.getFullYear() > this.today.getFullYear() + 1)
            {
              this.targetDay.setDate(this.targetDay.getDate() - 7);
              this.allowedDirections = 'left';
            }
            break;
        }
        this.targetWeek = this.setupWeek(this.targetDay);
        break;
      case "μήνας":
        // check if it is the first month of the previous year or the last month of the next year
        // then change the allowedDirections as necassery
        switch (dir)
        {
          case "left":
            this.targetDay.setMonth(this.targetDay.getMonth() - 1);
            if (this.targetDay.getFullYear() < this.today.getFullYear() - 1)
            {
              this.targetDay.setMonth(this.targetDay.getMonth() + 1);
              this.allowedDirections = 'right';
            }
            break;
          case "right":
            this.targetDay.setMonth(this.targetDay.getMonth() + 1);
            if (this.targetDay.getFullYear() > this.today.getFullYear() + 1)
            {
              this.targetDay.setMonth(this.targetDay.getMonth() - 1);
              this.allowedDirections = 'left';
            }
            break;
        }
        this.targetMonth = this.setupMonth(this.targetDay.getMonth());
        break;
      case "χρόνος":
        // check if it is the last year or the next year
        // then change the allowedDirections as necassery
        switch (dir)
        {
          case "left":
            this.targetDay.setFullYear(this.targetDay.getFullYear() - 1);
            if (this.targetDay.getFullYear() < this.today.getFullYear() - 1)
            {
              this.targetDay.setFullYear(this.targetDay.getFullYear() + 1);
              this.allowedDirections = 'right';
            }
            break;
          case "right":
            this.targetDay.setFullYear(this.targetDay.getFullYear() + 1);
            if (this.targetDay.getFullYear() > this.today.getFullYear() + 1)
            {
              this.targetDay.setFullYear(this.targetDay.getFullYear() - 1);
              this.allowedDirections = 'left';
            }
            break;
        }
        this.targetYear = this.setupYear(this.targetDay.getFullYear());
        break;
    }
  }
}
