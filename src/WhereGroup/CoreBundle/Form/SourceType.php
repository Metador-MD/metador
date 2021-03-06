<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * Class SourceType
 * @package WhereGroup\CoreBundle\Form
 */
class SourceType extends AbstractType
{

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('slug', TextType::class, ['label' => 'Slug'])
            ->add('name', TextType::class, ['label' => 'Name'])
            ->add('description', TextareaType::class, [
                'label'    => 'Beschreibung',
                'required' => false
            ])
            ->add('system', CheckboxType::class, [
                'label'    => 'System',
                'required' => false,
            ]);
    }
}
