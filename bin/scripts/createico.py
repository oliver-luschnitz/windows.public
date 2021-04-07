#!/usr/bin/env python2

from gimpfu import *
import time

gettext.install("gimp20-python", gimp.locale_directory, unicode=True)

def createico(image, notUsed1, notUsed2):
    gimp.context_push()
    image.undo_group_start()
    name = pdb.gimp_image_get_name(image)
    iconame = name[0:-3] + 'ico'
    layer1 = pdb.gimp_image_merge_visible_layers(image, 0)
    
    pdb.gimp_layer_resize_to_image_size(layer1)
    pdb.gimp_layer_set_name(layer1, "512")
    
    list = [256, 128, 64, 32, 16]
    for i in list:
        layer2 = pdb.gimp_layer_new_from_drawable(layer1, image)
        pdb.gimp_image_insert_layer(image, layer2, None, -1)
        pdb.gimp_layer_set_name(layer2, i)
        pdb.gimp_layer_scale(layer2, i, i, TRUE)
    
    image.undo_group_end()
    gimp.context_pop()

register(
    "python-fu-createico",
    "Create a Windows Icon file",
    "Adds layers to the image.",
    "Oliver Luschnitz",
    "Oliver Luschnitz",
    "2021",
    "<Image>/Filters/Prepare Windows Icon",
    "*",
    [(PF_IMAGE, "image", "Input image", None)],
    [],
    createico
    )

main()
