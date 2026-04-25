text = """
async getSideEffects(medicine: { name: string; dosage: string; instructions: string }): Promise<AIResponse> {
    const response = await api.post('/api/v1/ai/side-effects', {
      medicine: {
        name: medicine.name,
        dosage: medicine.dosage,
        instructions: medicine.instructions
      }
    });
    return response.data;
  }

  basically we need to create a route that takes this as input and returns the side effects of the medicine. The input will be a JSON object with the name, dosage, and instructions of the medicine. The output will be a JSON object with the side effects of the medicine. We will be again using qwen2.5:3b model which is sestuped already.
"""

# Remove newline characters
clean_text = text.replace("\n", " ")

print(clean_text)