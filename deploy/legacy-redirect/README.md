# Redirect from the old address

GitHub Pages does **not** redirect a project site when its repository is
renamed. These two files keep old links and bookmarks working after the repo
`Czech-for-english-speakers` is renamed to `prazak`.

Learners' progress is safe regardless: it lives in the browser under the origin
`zkrukoff.github.io`, which doesn't change. The new app copies it from the old
database on first load.

## Steps (after the redesign is merged)

1. Rename the repository `Zkrukoff/Czech-for-english-speakers` to `prazak`
   (Settings → General → Repository name). The deploy workflow picks up the new
   name automatically and the site moves to `https://zkrukoff.github.io/prazak/`.
2. Create a new, public repository named **`Czech-for-english-speakers`**
   containing only `index.html` and `404.html` from this folder.
3. In that repository, turn on Pages: Settings → Pages → Deploy from a branch →
   `main`, folder `/ (root)`.
4. Update local clones: `git remote set-url origin https://github.com/Zkrukoff/prazak.git`.

Creating a repo with the old name stops GitHub redirecting the *old git URL*
to the renamed repo, which is why step 4 is needed. Website visitors are
redirected by these files.

(Alternative, if you have a `zkrukoff.github.io` user site: put `index.html` in a
folder named `Czech-for-english-speakers/` there and skip step 2. Deep links
then need `404.html` at the **root** of the user site, where it would handle
every missing page on that site, so only do this if you don't use a custom 404.)
