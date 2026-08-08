# How to Run Frontend

* Right-click [FrontEnd/index.html](/d:/Alumni%20website/FrontEnd/index.html)
* Click `Open with Live Server`
* Do NOT click `Go Live` from the root folder unless the workspace setting below is present
* Use `http://localhost:5500`, not `http://127.0.0.1:5500`, when testing session login
* If login state behaves strangely, clear browser cookies for `localhost` or use an incognito window

This project keeps the frontend inside the `FrontEnd/` folder, so Live Server must serve that folder instead of the workspace root. A VS Code workspace setting has been added in [.vscode/settings.json](/d:/Alumni%20website/.vscode/settings.json) so `Go Live` opens the frontend correctly.
