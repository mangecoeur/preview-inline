# preview-inline package

A short description of your package.

Some pandoc-style latex math blocks:

$$
x = \frac{x}{2} + 2/1
$$

$$
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
$$

$$
\Phi = \begin{cases}
\Phi_L - G_{sol } \text{ if } \Phi_L \geq G_{sol}\\
\Phi_L \text{ if }  0 <\Phi_L \leq G_{sol}\\
0 \text{ otherwise }
\end{cases}
$$

And this is some inline math $T = \frac{x}{2}$ that should also work

More than one inline maths $T = \frac{x}{2}$ that should work $T = \frac{x}{2}$


$$
1 + \alpha
$$


![Local image](test-image.jpg)

![Local image without extension](test-image)

![is an invalid image on line 31](05.jpg)

![Image url](http://imgs.xkcd.com/comics/the_martian.png)

![Image on a wrapped line, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in](test-image.jpg)



Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. [@Everett1985b]

[@Kane2011]




Some math blocks in backticks

Raw backticks (markup.raw.gfm).

```
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
```


Tex backticks (markup.code.latex.gfm)

```tex
\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
```

\\
  \Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
\\


\Phi = H_{tr}(T_{i} - T_{e}) - gA_{sol} I_{sol} + H_{ve}W_s(T_{i} - T_{e})
