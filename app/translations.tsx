// eslint-disable-next-line import/no-named-as-default
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      Title: "MVG Observer",
      Description: "An unofficial departure monitor for Munich's subways",
      Tabs: {
        Matrix: "Matrix",
        Table: "Table",
        Map: "Map",
      },
      Links: {
        Overview: "Overview",
        Insights: "Insights",
        PITA: "Point In Time Analytics",
        Metrics: "Metrics",
      },
      Welcome: {
        Card: {
          Status: {
            Title: "Overview",
            Content:
              "Currently the Subway has <delay>{{ delay }}</delay> delay on average, which is <delayText>{{ delayText }}</delayText>.",
          },
          Highscore: {
            Content:
              "The largest delay on average is at the <station>{{ station }}</station> Station, currently at <delay>{{ delay }}</delay>.",
          },
          About: {
            Content:
              "If none of the next subways of a station has delay, the station will be displayed <green>green</green>. Has at least one subway a delay of under 5 minutes, the station is <yellow>yellow</yellow>. With more than 5 Minutes the station will be <red>red</red>.",
          },
        },
      },
      Table: {
        Filter: "Filter stations...",
        Columns: {
          Station: "Station",
          Departures: "Departures",
          Southbound: "Southbound",
          Northbound: "Northbound",
        },
        Tooltip: {
          Time: "Time",
          Departures: "Departures",
          PercDelay: "Delayed",
          AvgDelay: "Average Delay",
        },
        HelpText:
          "The table displays the next departures for each station, similiar to the popup in the grid.",
      },
      Occupancy: {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
        UNKNOWN: "Unknown",
        Occupancy: "Occupancy",
      },
      Misc: {
        Delay: "delay",
        Minute: "Minute",
        Minutes: "Minutes",
        Departed: "departed",
        SecondsShort: "Sec",
        LastRefresh: "Last refresh at",
        NoRealtimeData: "No realtime data available",
        DeparturePopoverHelp:
          "Shows the next 8  departures and their departure time. The original departuretime plus delay will be shown when hovering the departure time.",
      },
      PITA: {
        Subject: {
          Title: "Filter",
          Date: "Date",
          Line: "Subway Line",
          Interval: "Interval",
        },
        Realtime: {
          Title: "Realtime Data",
          Description:
            "The MVG data carries a realtime attribute. If set, the departure time is really a live timestamp. If this attribute is not set, the departure time might not reflect the real departure time.",
          Switch: "Realtime data only",
        },
        Percentage: {
          Title: "Analytics by Percentage",
          Description:
            "Instead of showing the average delay in a given interval, the percentage of delayed subways can be displayed. The threshold at which a subway counts as delayed can be configured.",
          Switch: "Enabled",
        },
        NoDepartures: {
          Title: "No Departures found",
          Description:
            "This can have multiple reason. If you have selected the U7 or U8, please note that they only operate on specific times and days. If you only include Realtime Date, you might get unlucky and hit a day in which no such data is available.",
        },
      },
      Insights: {
        Title: "Station Insights",
        Description:
          "Analyze station performance and delay patterns for your selected time period",
        Station: {
          Label: "Station",
          Placeholder: "Select a station",
        },
        DateRange: {
          StartDate: "Start Date",
          EndDate: "End Date",
          StartDatePlaceholder: "Select start date",
          EndDatePlaceholder: "Select end date",
        },
        Cards: {
          AverageDelay: "Average Delay",
          TotalDepartures: "Total Departures",
          DelayRate: "Delay Rate",
          Station: "Station",
        },
        Charts: {
          MonthlyDelayTrends: {
            Title: "Monthly Delay Trends",
            Description: "Average delays by month over the last year",
            NoData: "No monthly data available",
          },
          HourlyDelayPatterns: {
            Title: "Hourly Delay Patterns",
            Description: "Average delays throughout the day",
            NoData: "No hourly data available",
          },
          DepartureVolume: {
            Title: "Departure Volume by Month",
            Description: "Number of departures recorded each month",
            NoData: "No monthly departure data available",
          },
          DelayDistribution: {
            Title: "Delay Distribution",
            Description: "Breakdown of delays by severity",
            NoData: "No delay distribution data available",
          },
        },
        SelectStation: {
          Title: "Select a station to view insights",
          Description:
            "Choose a station from the dropdown above to see detailed statistics and trends",
        },
      },
    },
  },
  de: {
    translation: {
      Title: "MVG Observer",
      Description:
        "Ein inoffizieller Abfahrtsmonitor für die U-Bahnen in München",
      Tabs: {
        Matrix: "Matrix",
        Table: "Tabelle",
        Map: "Karte",
      },
      Links: {
        Overview: "Übersicht",
        Insights: "Einblicke",
        PITA: "Point-in-Time Analyse",
        Metrics: "Metriken",
      },
      Welcome: {
        Card: {
          Status: {
            Title: "Übersicht",
            Content:
              "Aktuell haben die U-Bahnen im Durchschnitt <delay>{{ delay }}</delay> Verspätung, das ist <delayText>{{ delayText }}</delayText>.",
          },
          Highscore: {
            Content:
              "Die größte durchschnittliche Verspätung hat im Moment die Station <station>{{ station }}</station> mit <delay>{{ delay }}</delay>.",
          },
          About: {
            Content:
              "Wenn keine der nächsten U-Bahnen an einer Station mehr als 0 Minuten Verspätung hat, also alle pünktlich sind, dann wird die Station <green>grün</green> angezeigt. Hat mindestens eine U-Bahn maximal 5 Minuten Verspätung, dann ist die Station <yellow>gelb</yellow>. Bei mehr als 5 Minuten Verspätung wird die Station dann <red>rot</red> dargestellt.",
          },
        },
      },
      Table: {
        Filter: "Stationen filtern...",
        Columns: {
          Station: "Station",
          Departures: "Abfahrten",
          Southbound: "Südwärts",
          Northbound: "Nordwärts",
        },
        Tooltip: {
          Time: "Uhrzeit",
          Departures: "Abfahrten",
          PercDelay: "Verspätet",
          AvgDelay: "Durchschn. Verspätung",
        },
        HelpText:
          "Die Tabelle zeigt die nächsten Abfahrten für jede Station, ähnlich wie das Grid, an.",
      },
      Occupancy: {
        LOW: "Niedrig",
        MEDIUM: "Mittel",
        HIGH: "Hoch",
        UNKNOWN: "Unbekannt",
        Occupancy: "Auslastung",
      },
      Misc: {
        Delay: "Verspätung",
        Minute: "Minute",
        Minutes: "Minuten",
        Departed: "abgefahren",
        SecondsShort: "Sek",
        LastRefresh: "Aktualisiert um",
        NoRealtimeData: "Keine Echtzeitinformationen verfügbar",
        DeparturePopoverHelp:
          "Zeigt die nächsten 8 Abfahrten und die dazugehörige Abfahrtszeit an. Die ursprüngliche Abfahrtszeit plus Verspätung wird beim hovern über die Zeit angezeigt.",
      },
      PITA: {
        Subject: {
          Title: "Filter",
          Date: "Datum",
          Line: "U-Bahn Linie",
          Interval: "Interval",
        },
        Realtime: {
          Title: "Echtzeitdaten",
          Description:
            "Die MVG Daten enthalten ein 'realtime' Attribut. Wenn es gesetzt ist entsprechen die Abfahrtszeiten wirklich der Echtzeit. Ist es nicht gesetzt sind die Zeiten nicht immer der Realität entprechend",
          Switch: "Nur Echtzeitdaten",
        },
        Percentage: {
          Title: "Prozentuale Analyse",
          Description:
            "Anstatt der durchschnittlichen Verspätung in einem Interval wird der Prozentsatz der U-Bahnen angezeigt die mehr Verspätung als der Schwellenwert haben angezeigt.",
          Switch: "Aktiv",
        },
        NoDepartures: {
          Title: "Keine Abfahrten gefunden",
          Description:
            "Das kann verschiedene Gründe haben. Die U7 und U8 fahren zum Beispiel nur an bestimmten Tagen und zu bestimmten Zeiten. Manchmal sind auch keine Echtzeitdaten verfügbar, vielleicht hattest du Pecht und dies ist einer dieser Tage?",
        },
      },
      Insights: {
        Title: "Stations Insights",
        Description:
          "Daten und Statistiken im gewählten Zeitraum auf Basis einer einzelnen Station",
        Station: {
          Label: "Station",
          Placeholder: "Station auswählen",
        },
        DateRange: {
          StartDate: "Startdatum",
          EndDate: "Enddatum",
          StartDatePlaceholder: "Startdatum auswählen",
          EndDatePlaceholder: "Enddatum auswählen",
        },
        Cards: {
          AverageDelay: "Durchschnittliche Verspätung",
          TotalDepartures: "Gesamte Abfahrten",
          DelayRate: "Verspätungsrate",
          Station: "Station",
        },
        Charts: {
          MonthlyDelayTrends: {
            Title: "Monatliche Verspätungstrends",
            Description:
              "Durchschnittliche Verspätungen nach Monaten im letzten Jahr",
            NoData: "Keine monatlichen Daten verfügbar",
          },
          HourlyDelayPatterns: {
            Title: "Stündliche Verspätungsmuster",
            Description: "Durchschnittliche Verspätungen über den Tag verteilt",
            NoData: "Keine stündlichen Daten verfügbar",
          },
          DepartureVolume: {
            Title: "Abfahrtsvolumen nach Monaten",
            Description: "Anzahl der aufgezeichneten Abfahrten pro Monat",
            NoData: "Keine monatlichen Abfahrtsdaten verfügbar",
          },
          DelayDistribution: {
            Title: "Verspätungsverteilung",
            Description: "Aufschlüsselung der Verspätungen nach Schweregrad",
            NoData: "Keine Verspätungsverteilungsdaten verfügbar",
          },
        },
        SelectStation: {
          Title: "Station auswählen, um Einblicke zu sehen",
          Description:
            "Wähle eine Station aus dem Dropdown oben aus, um detaillierte Statistiken und Trends zu sehen",
        },
      },
    },
  },
}

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
