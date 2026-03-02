import xml.etree.ElementTree as ET
import zipfile

def extract_highlighted_text(docx_path):
    with zipfile.ZipFile(docx_path) as docx:
        content = docx.read('word/document.xml')
        
    root = ET.fromstring(content)
    namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    # We will just print the whole text, but if a run has highlight, we bracket it [HIGHLIGHTED: text]
    for para in root.findall('.//w:p', namespace):
        para_text = ""
        for run in para.findall('.//w:r', namespace):
            text_node = run.find('w:t', namespace)
            if text_node is not None and text_node.text:
                text = text_node.text
                highlight = run.find('.//w:highlight', namespace)
                color = run.find('.//w:color', namespace)
                
                is_changed = False
                if highlight is not None or (color is not None and color.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') == 'FF0000'):
                    is_changed = True
                
                if is_changed:
                    para_text += f"[CLIENT_CHANGE: {text}]"
                else:
                    para_text += text
        if "[CLIENT_CHANGE:" in para_text:
            print(para_text)

extract_highlighted_text("TEXTO RD MODIFICIACIÓN RLOEX.docx")
