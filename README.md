# Studby Coding

Проект под версионирование через Git и GitHub.

## Синхронизация с GitHub

1. Создай новый репозиторий на [github.com](https://github.com/new) (без README, .gitignore — у тебя уже есть локально).
2. В терминале из папки проекта выполни (подставь свой URL репозитория):

```bash
git remote add origin https://github.com/ТВОЙ_ЛОГИН/studby-coding.git
git branch -M main
git push -u origin main
```

Дальше для отправки изменений:

```bash
git add .
git commit -m "Описание изменений"
git push
```

## Откат на предыдущую версию

- **Посмотреть историю:** `git log --oneline`
- **Откатить последний коммит (оставив изменения в файлах):** `git reset --soft HEAD~1`
- **Откатить до конкретного коммита (жёстко, файлы как тогда):** `git reset --hard ХЭШ_КОММИТА`
- **Восстановить старую версию одного файла:** `git checkout ХЭШ_КОММИТА -- путь/к/файлу`

После `git reset --hard` или изменений истории делай `git push --force` только если понимаешь последствия (перезаписывается история на GitHub).
