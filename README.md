# Quality of Life Report

An independent project related to the [Quality of Life Dashboard](https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard).

[DEMO](http://mcmap.org/qol-report/?s=2,10)

## Setup

``` bash
git clone https://github.com/tobinbradley/quality-of-life-report.git
cd quality-of-life-report
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data data
npm install
npm run datagen
npm run build
```

## Start the project

``` bash
npm run start
```

## Build for production

``` bash
npm run build
```

## URL Arguments

*   *s*: Neighborhoods to select, if any

### Notes

The second page of the report (first page past the map) will require a little massaging. In particular, the number grid you can either customize or toss as you see fit, and the logo/title is a static image. You can fix that in `app\index.html`.
