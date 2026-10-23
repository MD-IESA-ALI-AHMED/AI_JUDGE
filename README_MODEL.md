# LLaMA-3-8B Debate Judge: Automated Argument Quality Adjudication with QLoRA

An instruction fine-tuned low-rank adapter for Meta-Llama-3-8B-Instruct designed for automated debate adjudication. The model evaluates natural language debate arguments across premise-warrant strength, rhetorical coherence, and validity, outputting a calibrated score on a 10-point scale, an ordinal quality tier, and an analytical rationale.

## Project Overview

Evaluating competitive debate arguments requires reasoning over structural warrants, rhetorical clarity, and logical validity rather than surface-level lexical heuristics. This project fine-tunes Meta-Llama-3-8B-Instruct using Quantized Low-Rank Adaptation (QLoRA) on the IBM Argument Quality Ranking 30k dataset.

### Objectives

* **Calibrated Scoring:** Translate continuous crowd-annotated quality scores into an interpretable scale from 0.0 to 10.0.
* **Structured Output:** Strictly enforce structured generation conforming to turn-based chat schemas:
  * `Score: <float>/10`
  * `Quality Tier: <High | Moderate | Low>`
  * `Critique: <structured rationale>`
* **Resource Optimization:** Conduct end-to-end training within hardware constraints (NVIDIA Tesla T4 16 GB) without out-of-memory faults or gradient scaling failures.

## System Architecture and Specifications

| Hyperparameter / Component | Specification |
| :--- | :--- |
| **Base Model** | `meta-llama/Meta-Llama-3-8B-Instruct` |
| **Fine-Tuning Method** | QLoRA (4-bit NormalFloat Quantization + LoRA) |
| **Quantization Precision** | NF4 with double quantization (`bnb_4bit_use_double_quant=True`) |
| **Compute Dtype** | `torch.float16` |
| **LoRA Rank ($r$)** | `16` |
| **LoRA Alpha ($\alpha$)** | `32` (Scaling factor: $\frac{\alpha}{r} = 2.0$) |
| **LoRA Dropout** | `0.05` |
| **Target Modules** | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| **Trainable Parameters** | 41,943,040 / 8,072,204,288 (~0.52% of total parameters) |
| **Adapter Storage Size** | ~168 MB (`adapter_model.safetensors`) |

## Dataset and Preprocessing

The model is trained on the IBM Argument Quality Ranking 30k dataset, which provides arguments annotated with an MACE-weighted average quality score ($WA \in [0.0, 1.0]$).

### Calibration Mapping

1. **Continuous Score:** $\text{Score}_{10} = \text{round}(WA \times 10, 1)$
2. **Quality Tiers:**
   * **High ($WA \ge 0.65$):** Valid logical reasoning, relevant factual warrants, and strong debate structure.
   * **Moderate ($0.40 \le WA < 0.65$):** Valid core premise but exhibits weaker warrants or moderate rhetorical clarity.
   * **Low ($WA < 0.40$):** Deficient logical coherence, unsupported assertions, or minimal topical relevance.

### Input Formatting

Data instances are rendered using the standard LLaMA-3 Instruct chat template syntax:

```text
<|start_header_id|>system<|end_header_id|>
You are an expert collegiate debate adjudicator. Your duty is to analyze debate arguments for premise-warrant strength, logical validity, and rhetorical impact, and output a structured assessment.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Topic: {topic}
Stance: {Pro / In Favor | Con / Opposed}
Argument: {argument}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
Score: {score}/10
Quality Tier: {High | Moderate | Low}
Critique: {critique}<|eot_id|>
```

* **Dataset Partition:** 19,925 training examples (95%) and 1,049 validation examples (5%), split using a fixed random seed.

## Training Configuration and Implementation Details

Fine-tuning was executed using Hugging Face `TRL`'s `SFTTrainer` and PyTorch `accelerate`:

* **Batch Configuration:** Per-device micro-batch size of `2` with `gradient_accumulation_steps=8`, yielding an effective global batch size of `16`.
* **Context Length:** Fixed maximum sequence length of 512 tokens.
* **Optimizer:** `paged_adamw_8bit` to minimize optimizer memory footprints and mitigate transient activation spikes via host memory paging.
* **Learning Rate Schedule:** Peak learning rate of `2e-4` with 100 warmup steps followed by cosine decay.
* **Fault Tolerance:** Automated checkpointing every 200 steps with state retention limited to the two latest instances and recovery via `get_last_checkpoint`.

### Technical Resolutions

1. **Mixed Precision Gradient Scaler Collision:**
   On NVIDIA Turing hardware, PyTorch does not implement `_amp_foreach_non_finite_check_and_unscale_cuda` for unscaled mixed-precision tensors when `fp16=True` triggers `GradScaler`. This was resolved by setting `fp16=False` and `bf16=False` in `SFTConfig`, relying instead on BitsAndBytes' internal dynamic float dequantization.
2. **Non-Reentrant Checkpointing:**
   Standard reentrant checkpointing disrupts autograd hooks required by LoRA adapters. Passing `gradient_checkpointing_kwargs={"use_reentrant": False}` ensures backward graph tracking remains intact throughout fine-tuning.

## Training Dynamics

Evaluation metrics logged across optimization steps:

| Step | Epoch Equivalent | Training Loss | Validation Loss | Entropy | Mean Token Accuracy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **200** | 0.16 | 0.4836 | 0.4811 | 0.5208 | 87.80% |
| **400** | 0.32 | 0.4668 | 0.4747 | 0.4867 | 87.80% |
| **600** | 0.48 | 0.4669 | 0.4680 | 0.4793 | 87.87% |
| **800** | 0.64 | 0.4535 | 0.4639 | 0.4740 | 88.01% |
| **1000** | 0.80 | 0.4548 | 0.4601 | 0.4637 | 88.01% |

Validation loss decreased monotonically in parallel with training loss, indicating consistent generalization across unobserved debate topics without overfitting.

## Inference Pipeline

### Requirements

```bash
pip install -U torch transformers peft bitsandbytes accelerate
```

### Execution Example

```python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

BASE_MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"
ADAPTER_ID = "md-iesa-04/llama-3-8b-debate-judge"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, use_fast=True)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_ID,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16
)

model = PeftModel.from_pretrained(base_model, ADAPTER_ID)
model.eval()

messages = [
    {
        "role": "system",
        "content": "You are an expert collegiate debate adjudicator. Your duty is to analyze debate arguments for premise-warrant strength, logical validity, and rhetorical impact, and output a structured assessment."
    },
    {
        "role": "user",
        "content": "Topic: Social media platforms should be held legally liable for user content\nStance: Pro / In Favor\nArgument: Algorithmic amplification rewards sensationalism over factuality. Because private platforms profit directly from engagement generated by dangerous misinformation, standard common-carrier protections no longer align with their commercial operational model."
    }
]

prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        eos_token_id=tokenizer.convert_tokens_to_ids("<|eot_id|>"),
        pad_token_id=tokenizer.eos_token_id,
        do_sample=False
    )

response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
print(response)
```

## Repository Structure

```text
├── notebooks/
│   └── Fine_Tuning.ipynb        # Interactive training and evaluation notebook
├── src/
│   ├── config.py                # Hyperparameters, LoRA parameters, and paths
│   ├── dataset.py               # Dataset ingestion and prompt-formatting utilities
│   ├── train.py                 # Standalone training script
│   └── inference.py             # Inference and benchmarking routines
├── README.md                    # Technical documentation
└── requirements.txt             # Pinned package dependencies
```

## License and Attribution

* **Base Model:** Meta LLaMA 3 License ([Meta LLaMA 3 Community License Agreement](https://llama.meta.com/llama3/license/))
* **Dataset:** IBM Research Argument Quality Ranking 30k (CC BY-SA 4.0)
* **Software:** MIT License
