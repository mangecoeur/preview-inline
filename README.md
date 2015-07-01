# Preview LaTeX maths and Images inline

**Requires pandoc flavor markdown (`language-pfm` package)**

Preview Latex formula and images embedded directly in your documents - no need to generate a full PDF or HTML preview to check your figures and formula!

![screenshot of image-preview](https://raw.githubusercontent.com/mangecoeur/preview-inline/master/resources/ScreenShot1.png)

This project is intended to be part of a larger suite of tools for markdown for academic writing.

## Acknowledgements

Currently uses the free LaTeX formula rendering API from [CodeCogs](http://www.codecogs.com/latex/eqneditor.php) as a fallback for formula that can't be parsed by KaTeX. In the future this should be replaced with local MathJax rendering to remove the dependance on an online service.

<a href="http://www.codecogs.com" target="_blank"><img src="http://www.codecogs.com/images/poweredbycodecogs.png" border="0" title="CodeCogs - An Open Source Scientific Library" alt="CodeCogs - An Open Source Scientific Library"></a>

# Install

Requires pandoc flavor markdown (`language-pfm` package)

# Usage

Place your cursor within the image link or inside a math block and trigger 'preview-inline: show' or use the keyboard shortcut 'ctrl-alt-p'.

# Contribute

Contributions via pull request are welcome.

## TODO

Non-exhaustive todo list:

- [ ] better support for non-markdown files
- [ ] MathJax fallback for maths that KaTeX can't handle
- [ ] Live update of maths as you type with small delay
- [ ] Display preview as inline block instead of overlay (?)
- [ ] More test coverage
