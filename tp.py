text = """
  ERROR  SyntaxError: C:\Ayaan\Projects\Sem 6 Mpr\rxguardian\app\(tabs)\meds.tsx: Identifier 'styles' has already been declared. (399:6)

  397 |
  398 |
> 399 | const styles = StyleSheet.create({
      |       ^
  400 |   safe: { flex: 1, backgroundColor: theme.colors.background },
  401 |
  402 |   header: {
"""

# Remove newline characters
clean_text = text.replace("\n", " ")

print(clean_text)