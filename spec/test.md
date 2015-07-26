# preview-inline package

A short description of your package.

![on buffer line 5](/Users/jonathanchambers/Pictures/gravatar.jpg)

![on buffer line 7](test-image.jpg)

![is an invalid image on line 9](05.jpg)

![is an image url on line 11](http://imgs.xkcd.com/comics/the_martian.png)


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."





Some pandoc-style latex math blocks:

$$
x = \frac{x}{2} + 2/1
$$

$$
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
$$

$$
\Phi = \begin{cases}
\Phi_L - G_{sol} \text{ if } \Phi_L \geq G_{sol}\\
\Phi_L \text{ if } 0 <\Phi_L \leq G_{sol}\\
0 \text{ otherwise}
\end{cases}
$$

And this is some inline math $T = \frac{x}{2}$ that should also work

Some math blocks in backticks

Raw backticks (markup.raw.gfm). 

```
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
```


Tex backticks (markup.code.latex.gfm)

```tex
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
```
