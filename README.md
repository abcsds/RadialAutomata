# Radial Cellular Automata Generator

A radial cellular automata visualization tool designed for generating circular patterns, perfect for knitting or crochet in the round projects.

## Features

- **Radial Grid**: Cells arranged in concentric circles instead of rectangular grids
- **Expansion Cells**: Automatically handles increasing circumference while maintaining cellular automata properties
- **Interactive Controls**: Adjust parameters in real-time:
  - Initial cell count
  - Number of rings
  - Expansion interval
  - Visual parameters (radius, spacing, cell size)
  - Ruleset (elementary cellular automata rules)
  - Initial pattern

## Usage

### Controls

- **Initial Cell Count**: Number of cells in the innermost ring
- **Number of Rings**: Total concentric rings to generate
- **Expansion Interval**: Frequency of expansion cells (every N cells)
- **Start Radius**: Radius of the first ring
- **Ring Spacing**: Distance between rings
- **Cell Size**: Diameter of each cell circle
- **Ruleset**: 8-bit binary string (e.g., "01011010" for Rule 90)
- **Initial Pattern**: Starting pattern as comma-separated 0s and 1s

## How It Works

The generator creates cellular automata on a radial grid where:
1. The first ring starts with a configurable number of cells
2. Each subsequent ring expands radially with "expansion cells" interspersed
3. Expansion cells copy their parent's value
4. Non-expansion cells follow cellular automata rules based on their three neighbors from the previous ring
5. This maintains CA mathematical properties while accommodating circular geometry

Perfect for designing mathematical crochet patterns with predictable stitch counts!

## Technologies

- p5.js for visualization
- Vanilla JavaScript
