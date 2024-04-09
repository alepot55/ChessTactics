const indirizzoServer = `http://localhost:3000/server.php`;
const immaginiDaSostituire = {
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgZmlsbD0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIyIDEwYzEwLjUgMSAxNi41IDggMTYgMjlIMTVjMC05IDEwLTYuNSA4LTIxIi8+PHBhdGggZD0iTTI0IDE4Yy4zOCAyLjkxLTUuNTUgNy4zNy04IDktMyAyLTIuODIgNC4zNC01IDQtMS4wNDItLjk0IDEuNDEtMy4wNCAwLTMtMSAwIC4xOSAxLjIzLTEgMi0xIDAtNC4wMDMgMS00LTQgMC0yIDYtMTIgNi0xMnMxLjg5LTEuOSAyLTMuNWMtLjczLS45OTQtLjUtMi0uNS0zIDEtMSAzIDIuNSAzIDIuNWgycy43OC0xLjk5MiAyLjUtM2MxIDAgMSAzIDEgMyIvPjwvZz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVjLS40MTQuNzE3LS45NDQgMS4xODctMS4xODMgMS4wNDlzLS4wOTctLjgzMi4zMTctMS41NDkuOTQ0LTEuMTg3IDEuMTgzLTEuMDQ5LjA5Ny44MzItLjMxNyAxLjU0OXoiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2U9IiNmZmYiLz48cGF0aCBkPSJNMjQuNTUgMTAuNGwtLjQ1IDEuNDUuNS4xNWMzLjE1IDEgNS42NSAyLjQ5IDcuOSA2Ljc1UzM1Ljc1IDI5LjA2IDM1LjI1IDM5bC0uMDUuNWgyLjI1bC4wNS0uNWMuNS0xMC4wNi0uODgtMTYuODUtMy4yNS0yMS4zNHMtNS43OS02LjY0LTkuMTktNy4xNmwtLjUxLS4xeiIgc3Ryb2tlPSJub25lIi8+PC9nPjwvc3ZnPg==': 'nb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIyIDEwYzEwLjUgMSAxNi41IDggMTYgMjlIMTVjMC05IDEwLTYuNSA4LTIxIi8+PHBhdGggZD0iTTI0IDE4Yy4zOCAyLjkxLTUuNTUgNy4zNy04IDktMyAyLTIuODIgNC4zNC01IDQtMS4wNDItLjk0IDEuNDEtMy4wNCAwLTMtMSAwIC4xOSAxLjIzLTEgMi0xIDAtNC4wMDMgMS00LTQgMC0yIDYtMTIgNi0xMnMxLjg5LTEuOSAyLTMuNWMtLjczLS45OTQtLjUtMi0uNS0zIDEtMSAzIDIuNSAzIDIuNWgycy43OC0xLjk5MiAyLjUtM2MxIDAgMSAzIDEgMyIvPjwvZz48cGF0aCBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVjLS40MTQuNzE3LS45NDQgMS4xODctMS4xODMgMS4wNDlzLS4wOTctLjgzMi4zMTctMS41NDkuOTQ0LTEuMTg3IDEuMTgzLTEuMDQ5LjA5Ny44MzItLjMxNyAxLjU0OXoiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+': 'nw',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgZmlsbD0iIzAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik05IDM2YzMuMzktLjk3IDEwLjExLjQzIDEzLjUtMiAzLjM5IDIuNDMgMTAuMTEgMS4wMyAxMy41IDIgMCAwIDEuNjUuNTQgMyAyLS42OC45Ny0xLjY1Ljk5LTMgLjUtMy4zOS0uOTctMTAuMTEuNDYtMTMuNS0xLTMuMzkgMS40Ni0xMC4xMS4wMy0xMy41IDEtMS4zNS40OS0yLjMyLjQ3LTMtLjUgMS4zNS0xLjQ2IDMtMiAzLTJ6bTYtNGMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L3N2Zz4=': 'bb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik0yMi41IDExLjYzVjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMi41IDI1czQuNS03LjUgMy0xMC41YzAgMC0xLTIuNS0zLTIuNXMtMyAyLjUtMyAyLjVjLTEuNSAzIDMgMTAuNSAzIDEwLjUiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBmaWxsPSIjMDAwIi8+PC9nPjxnIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTEyLjUgMzdjNS41IDMuNSAxNC41IDMuNSAyMCAwdi03czktNC41IDYtMTAuNWMtNC02LjUtMTMuNS0zLjUtMTYgNFYyN3YtMy41Yy0yLjUtNy41LTEyLTEwLjUtMTYtNC0zIDYgNiAxMC41IDYgMTAuNXY3IiBmaWxsPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0yMCA4aDUiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTMyIDI5LjVzOC41LTQgNi4wMy05LjY1QzM0LjE1IDE0IDI1IDE4IDIyLjUgMjQuNXYyLjEtMi4xQzIwIDE4IDEwLjg1IDE0IDYuOTcgMTkuODUgNC41IDI1LjUgMTMgMjkuNSAxMyAyOS41bS0uNS41YzUuNS0zIDE0LjUtMyAyMCAwbS0yMCAzLjVjNS41LTMgMTQuNS0zIDIwIDBtLTIwIDMuNWM1LjUtMyAxNC41LTMgMjAgMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZT0iI2ZmZiIvPjwvZz48L3N2Zz4=': 'kb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgeG1sbnM6dj0iaHR0cHM6Ly92ZWN0YS5pby9uYW5vIj48cGF0aCBkPSJNMjIuNSA5YTQgNCAwIDAgMC00IDRjMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOGE0IDQgMCAwIDAtNC00eiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==': 'pb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgc3Ryb2tlPSIjMDAwIiB4bWxuczp2PSJodHRwczovL3ZlY3RhLmlvL25hbm8iPjxnIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ij48cGF0aCBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDIuNS0xMi41TDMxIDI1bC0uMy0xNC4xLTUuMiAxMy42LTMtMTQuNS0zIDE0LjUtNS4yLTEzLjZMMTQgMjUgNi41IDEzLjUgOSAyNnoiLz48cGF0aCBkPSJNOSAyNmMwIDIgMS41IDIgMi41IDQgMSAxLjUgMSAxIC41IDMuNS0xLjUgMS0xIDIuNS0xIDIuNS0xLjUgMS41IDAgMi41IDAgMi41IDYuNSAxIDE2LjUgMSAyMyAwIDAgMCAxLjUtMSAwLTIuNSAwIDAgLjUtMS41LTEtMi41LS41LTIuNS0uNS0yIC41LTMuNSAxLTIgMi41LTIgMi41LTQtOC41LTEuNS0xOC41LTEuNS0yNyAweiIvPjxwYXRoIGQ9Ik0xMS41IDMwYzMuNS0xIDE4LjUtMSAyMiAwTTEyIDMzLjVjNi0xIDE1LTEgMjEgMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIyIi8+PGNpcmNsZSBjeD0iMTQiIGN5PSI5IiByPSIyIi8+PGNpcmNsZSBjeD0iMjIuNSIgY3k9IjgiIHI9IjIiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjkiIHI9IjIiLz48Y2lyY2xlIGN4PSIzOSIgY3k9IjEyIiByPSIyIi8+PHBhdGggZD0iTTExIDM4LjVhMzUgMzUgMSAwIDAgMjMgMCIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIGZpbGw9Im5vbmUiLz48L2c+PHBhdGggZD0iTTExIDI5YTM1IDM1IDEgMCAxIDIzIDBtLTIxLjUgMi41aDIwbS0yMSAzYTM1IDM1IDEgMCAwIDIyIDBtLTIzIDNhMzUgMzUgMSAwIDAgMjQgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+': 'qb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3ptMy41LTdsMS41LTIuNWgxN2wxLjUgMi41aC0yMHoiLz48cGF0aCBkPSJNMTIgMzZ2LTRoMjF2NEgxMnoiLz48L2c+PHBhdGggZD0iTTE0IDI5LjV2LTEzaDE3djEzSDE0eiIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48ZyBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTQgMTYuNUwxMSAxNGgyM2wtMyAyLjVIMTR6IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xMSAxNFY5aDR2Mmg1VjloNXYyaDVWOWg0djVIMTF6IiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvZz48cGF0aCBkPSJNMTIgMzUuNWgyMW0tMjAtNGgxOW0tMTgtMmgxN20tMTctMTNoMTdNMTEgMTRoMjMiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=': 'rb',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik05IDM2YzMuMzktLjk3IDEwLjExLjQzIDEzLjUtMiAzLjM5IDIuNDMgMTAuMTEgMS4wMyAxMy41IDIgMCAwIDEuNjUuNTQgMyAyLS42OC45Ny0xLjY1Ljk5LTMgLjUtMy4zOS0uOTctMTAuMTEuNDYtMTMuNS0xLTMuMzkgMS40Ni0xMC4xMS4wMy0xMy41IDEtMS4zNS40OS0yLjMyLjQ3LTMtLjUgMS4zNS0xLjQ2IDMtMiAzLTJ6bTYtNGMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9zdmc+': 'bw',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTIyLjUgMTEuNjNWNiIvPjxwYXRoIGQ9Ik0yMCA4aDUiLz48L2c+PHBhdGggZD0iTTIyLjUgMjVzNC41LTcuNSAzLTEwLjVjMCAwLTEtMi41LTMtMi41cy0zIDIuNS0zIDIuNWMtMS41IDMgMyAxMC41IDMgMTAuNSIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9IiNmZmYiLz48ZyBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIuNSAzN2M1LjUgMy41IDE0LjUgMy41IDIwIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTIuNS03LjUtMTItMTAuNS0xNi00LTMgNiA2IDEwLjUgNiAxMC41djciIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTIuNSAzMGM1LjUtMyAxNC41LTMgMjAgMG0tMjAgMy41YzUuNS0zIDE0LjUtMyAyMCAwbS0yMCAzLjVjNS41LTMgMTQuNS0zIDIwIDAiLz48L2c+PC9zdmc+': 'kw',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgeG1sbnM6dj0iaHR0cHM6Ly92ZWN0YS5pby9uYW5vIj48cGF0aCBkPSJNMjIuNSA5YTQgNCAwIDAgMC00IDRjMCAuODkuMjkgMS43MS43OCAyLjM4QzE3LjMzIDE2LjUgMTYgMTguNTkgMTYgMjFjMCAyLjAzLjk0IDMuODQgMi40MSA1LjAzLTMgMS4wNi03LjQxIDUuNTUtNy40MSAxMy40N2gyM2MwLTcuOTItNC40MS0xMi40MS03LjQxLTEzLjQ3IDEuNDctMS4xOSAyLjQxLTMgMi40MS01LjAzIDAtMi40MS0xLjMzLTQuNS0zLjI4LTUuNjIuNDktLjY3Ljc4LTEuNDkuNzgtMi4zOGE0IDQgMCAwIDAtNC00eiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==': 'pw',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgeG1sbnM6dj0iaHR0cHM6Ly92ZWN0YS5pby9uYW5vIj48cGF0aCBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDIuNS0xMi41TDMxIDI1bC0uMy0xNC4xLTUuMiAxMy42LTMtMTQuNS0zIDE0LjUtNS4yLTEzLjZMMTQgMjUgNi41IDEzLjUgOSAyNnoiLz48cGF0aCBkPSJNOSAyNmMwIDIgMS41IDIgMi41IDQgMSAxLjUgMSAxIC41IDMuNS0xLjUgMS0xIDIuNS0xIDIuNS0xLjUgMS41IDAgMi41IDAgMi41IDYuNSAxIDE2LjUgMSAyMyAwIDAgMCAxLjUtMSAwLTIuNSAwIDAgLjUtMS41LTEtMi41LS41LTIuNS0uNS0yIC41LTMuNSAxLTIgMi41LTIgMi41LTQtOC41LTEuNS0xOC41LTEuNS0yNyAweiIvPjxwYXRoIGQ9Ik0xMS41IDMwYzMuNS0xIDE4LjUtMSAyMiAwTTEyIDMzLjVjNi0xIDE1LTEgMjEgMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjYiIGN5PSIxMiIgcj0iMiIvPjxjaXJjbGUgY3g9IjE0IiBjeT0iOSIgcj0iMiIvPjxjaXJjbGUgY3g9IjIyLjUiIGN5PSI4IiByPSIyIi8+PGNpcmNsZSBjeD0iMzEiIGN5PSI5IiByPSIyIi8+PGNpcmNsZSBjeD0iMzkiIGN5PSIxMiIgcj0iMiIvPjwvc3ZnPg==': 'qw',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik05IDM5aDI3di0zSDl2M3oiLz48cGF0aCBkPSJNMTIgMzZ2LTRoMjF2NEgxMnoiLz48cGF0aCBkPSJNMTEgMTRWOWg0djJoNVY5aDV2Mmg1VjloNHY1IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0zNCAxNGwtMyAzSDE0bC0zLTMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48cGF0aCBkPSJNMzEgMTd2MTIuNUgxNFYxNyIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGcgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48cGF0aCBkPSJNMzEgMjkuNWwxLjUgMi41aC0yMGwxLjUtMi41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xMSAxNGgyMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L2c+PC9zdmc+': 'rw'
};
temaPezzi = 'default';
temaScacchiera = 'default';
coloriScacchiera = {
    'default': {
        'chiaro': '#f0d9b5',
        'scuro': '#b58863'
    },
    'verde': {
        'chiaro': '#9ee0bc',
        'scuro': '#00ad88'
    },
    'blu': {
        'chiaro': '#7dd3e2',
        'scuro': '#277ece'
    }
}

function applicaTema(tema1 = temaPezzi, tema2 = temaScacchiera) {
    if (tema1 !== 'default') {
        for (let srcVecchio in immaginiDaSostituire) {
            let pedina = immaginiDaSostituire[srcVecchio];
            // Seleziona tutti gli elementi img
            var imgElements = document.getElementsByTagName('img');

            // Controlla ogni elemento img
            for (var i = 0; i < imgElements.length; i++) {
                // Se l'elemento img ha l'src vecchio, sostituiscilo con il nuovo
                if (imgElements[i].src === srcVecchio) {
                    imgElements[i].src = pieceTheme(pedina, tema1);
                }
            }
        }
    }
    if (tema2 !== 'default') {
        let caselleDaColorare = document.querySelectorAll('[data-square-coord]');
        caselleDaColorare.forEach(casella => {
            let colori = coloriScacchiera[tema2];
            let colore = colori['chiaro'];
            if (casella.classList.contains('black-b7cb6')) colore = colori['scuro'];
            casella.style.backgroundColor = colore;
        });
    }
}

function bloccaMossa(pezzo, partita) {
    if ((partita.turn() === 'w' && pezzo.search(/^b/) !== -1) || (partita.turn() === 'b' && pezzo.search(/^w/) !== -1)) return false
    return true;
}

function mostraSuggerimenti(args, partita, getCasellaCliccata, idScacchiera) {
    if (getCasellaCliccata()) return;
    rimuoviSuggerimenti()
    applicaTema();
    let mosse = getMossePossibili(partita, args['square']);
    if (mosse.length === 0) return;
    mosse.forEach(mossa => {
        coloraCasella(mossa.to, idScacchiera);
    });
}

function gestisciClick(args, partita, scacchiera, getCasellaCliccata, onDrop, setCasellaCliccata, idScacchiera) {
    if (args['square'] == null) return null;
    let pezzoPosseduto = partita.get(args['square']) !== null && partita.get(args['square'])['color'] === partita.turn();
    rimuoviSuggerimenti();
    if (getCasellaCliccata() !== null && !pezzoPosseduto) {
        onDrop({ 'source': getCasellaCliccata(), 'target': args['square'] });
        setCasellaCliccata(null);
    } else {
        if (pezzoPosseduto) setCasellaCliccata(null);
        mostraSuggerimenti(args, partita, getCasellaCliccata, idScacchiera);
        mosse = getMossePossibili(partita, args['square']);
        setCasellaCliccata(pezzoPosseduto && mosse.length > 0 ? args['square'] : null);
    }
}

function eseguiMossa(mossa, partita, scacchiera, applica = true) {
    partita.move({
        from: mossa.slice(0, 2),
        to: mossa.slice(2, 4),
        promotion: 'q'
    });
    scacchiera.position(partita.fen(), 'slow');
    if (applica) applicaTema();
}

function getMossePossibili(partita, casella, verbose = true) {
    return partita.moves({
        square: casella,
        verbose: verbose
    });
}

function rimuoviSuggerimenti() {
    document.querySelectorAll('[data-square-coord]').forEach(casella => {
        casella.style.backgroundColor = '';
    });
}

function coloraCasella(casella, idScacchiera, temaScacchiera = 'grigio') {
    let colori = coloriScacchiera[temaScacchiera];
    const $casella = document.querySelector('#' + idScacchiera + ' [data-square-coord="' + casella + '"]')

    let colore = '#a9a9a9';
    if ($casella.classList.contains('black-b7cb6')) colore = '#696969';

    $casella.style.backgroundColor = colore;
}

function isPezzoBianco(pezzo) { return /^w/.test(pezzo) }
function isPezzoNero(pezzo) { return /^b/.test(pezzo) }

async function inviaDatiAlServer(dati, evento = null) {
    if (evento !== null) evento.preventDefault();
    let risposta = await fetch(indirizzoServer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(dati).toString()
    });

    if (risposta.ok) {
        return await risposta.json();
    }
}


function pieceTheme(piece, tema) {
    return 'assets/pedine/' + tema + '/' + piece + '.svg';
}